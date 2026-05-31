using Microsoft.Data.Sqlite;
using Nexus.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Text.RegularExpressions;

namespace Nexus.Services;

public class DatabaseService
{
    private readonly string dbPath;
    private readonly string connectionString;
    private readonly MongoDbService _mongoService;

    public MongoDbService MongoService => _mongoService;

    public DatabaseService()
    {
        var appData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
        var folder = Path.Combine(appData, "Nexus");
        Directory.CreateDirectory(folder);
        dbPath = Path.Combine(folder, "nexus.db");
        connectionString = $"Data Source={dbPath}";
        _mongoService = new MongoDbService();
        InitializeDatabase();
    }

    private void InitializeDatabase()
    {
        using var conn = new SqliteConnection(connectionString);
        conn.Open();

        var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            CREATE TABLE IF NOT EXISTS Notes (
                Id INTEGER PRIMARY KEY AUTOINCREMENT,
                Title TEXT NOT NULL,
                Content TEXT NOT NULL,
                CreatedAt TEXT NOT NULL,
                UpdatedAt TEXT NOT NULL
            );
            CREATE VIRTUAL TABLE IF NOT EXISTS NotesSearch USING fts5(Title, Content);
            CREATE TABLE IF NOT EXISTS Links (
                SourceId INTEGER,
                TargetId INTEGER,
                PRIMARY KEY (SourceId, TargetId)
            );";
        cmd.ExecuteNonQuery();
    }

    public void DeleteLink(int sourceId, int targetId)
    {
        using var conn = new SqliteConnection(connectionString);
        conn.Open();
        
        var cmd = conn.CreateCommand();
        cmd.CommandText = "DELETE FROM Links WHERE SourceId=@source AND TargetId=@target";
        cmd.Parameters.AddWithValue("@source", sourceId);
        cmd.Parameters.AddWithValue("@target", targetId);
        cmd.ExecuteNonQuery();
        
        // Sync to MongoDB
        _ = _mongoService.DeleteLinkAsync(sourceId, targetId);
    }

    public List<Link> GetAllLinks()
    {
        var links = new List<Link>();
        using var conn = new SqliteConnection(connectionString);
        conn.Open();
        
        var cmd = conn.CreateCommand();
        cmd.CommandText = "SELECT SourceId, TargetId FROM Links";
        using var reader = cmd.ExecuteReader();
        while (reader.Read())
            links.Add(new Link { SourceId = reader.GetInt32(0), TargetId = reader.GetInt32(1) });
        
        return links;
    }

    public void CreateLink(int sourceId, int targetId)
    {
        using var conn = new SqliteConnection(connectionString);
        conn.Open();
        
        var cmd = conn.CreateCommand();
        cmd.CommandText = "INSERT OR IGNORE INTO Links (SourceId, TargetId) VALUES (@source, @target)";
        cmd.Parameters.AddWithValue("@source", sourceId);
        cmd.Parameters.AddWithValue("@target", targetId);
        cmd.ExecuteNonQuery();
        
        // Sync to MongoDB
        _ = _mongoService.SyncLinkAsync(sourceId, targetId);
    }

    public void DeleteNote(int noteId)
    {
        using var conn = new SqliteConnection(connectionString);
        conn.Open();
        
        using var transaction = conn.BeginTransaction();
        try
        {
            // Delete links
            var delLinksCmd = conn.CreateCommand();
            delLinksCmd.CommandText = "DELETE FROM Links WHERE SourceId=@id OR TargetId=@id";
            delLinksCmd.Parameters.AddWithValue("@id", noteId);
            delLinksCmd.ExecuteNonQuery();
            
            // Delete note
            var delNoteCmd = conn.CreateCommand();
            delNoteCmd.CommandText = "DELETE FROM Notes WHERE Id=@id";
            delNoteCmd.Parameters.AddWithValue("@id", noteId);
            delNoteCmd.ExecuteNonQuery();
            
            transaction.Commit();
            
            // Sync to MongoDB
            _ = _mongoService.DeleteNoteAsync(noteId);
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }

    public List<Note> Search(string query)
    {
        var results = new List<Note>();
        using var conn = new SqliteConnection(connectionString);
        conn.Open();
        
        var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            SELECT n.* FROM Notes n
            WHERE n.Title LIKE @query OR n.Content LIKE @query
            ORDER BY n.UpdatedAt DESC";
        cmd.Parameters.AddWithValue("@query", $"%{query}%");
        
        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            results.Add(new Note
            {
                Id = reader.GetInt32(0),
                Title = reader.GetString(1),
                Content = reader.GetString(2),
                CreatedAt = DateTime.Parse(reader.GetString(3)),
                UpdatedAt = DateTime.Parse(reader.GetString(4))
            });
        }
        return results;
    }

    public List<Note> GetAllNotes()
    {
        var notes = new List<Note>();
        using var conn = new SqliteConnection(connectionString);
        conn.Open();
        var cmd = conn.CreateCommand();
        cmd.CommandText = "SELECT * FROM Notes ORDER BY UpdatedAt DESC";
        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            notes.Add(new Note
            {
                Id = reader.GetInt32(0),
                Title = reader.GetString(1),
                Content = reader.GetString(2),
                CreatedAt = DateTime.Parse(reader.GetString(3)),
                UpdatedAt = DateTime.Parse(reader.GetString(4))
            });
        }
        return notes;
    }

    public void SaveNote(Note note)
    {
        using var conn = new SqliteConnection(connectionString);
        conn.Open();
        
        using var transaction = conn.BeginTransaction();
        try
        {
            var cmd = conn.CreateCommand();
            
            if (note.Id == 0)
            {
                cmd.CommandText = "INSERT INTO Notes (Title, Content, CreatedAt, UpdatedAt) VALUES (@title, @content, @created, @updated); SELECT last_insert_rowid();";
                cmd.Parameters.AddWithValue("@title", note.Title);
                cmd.Parameters.AddWithValue("@content", note.Content);
                cmd.Parameters.AddWithValue("@created", note.CreatedAt.ToString("o"));
                cmd.Parameters.AddWithValue("@updated", note.UpdatedAt.ToString("o"));
                note.Id = Convert.ToInt32(cmd.ExecuteScalar());
            }
            else
            {
                cmd.CommandText = "UPDATE Notes SET Title=@title, Content=@content, UpdatedAt=@updated WHERE Id=@id";
                cmd.Parameters.AddWithValue("@id", note.Id);
                cmd.Parameters.AddWithValue("@title", note.Title);
                cmd.Parameters.AddWithValue("@content", note.Content);
                cmd.Parameters.AddWithValue("@updated", note.UpdatedAt.ToString("o"));
                cmd.ExecuteNonQuery();
            }
            
            UpdateLinks(note, conn);
            transaction.Commit();
            
            // Sync to MongoDB
            _ = _mongoService.SyncNoteAsync(note);
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }

    private void UpdateLinks(Note note, SqliteConnection conn)
    {
        var links = ExtractLinks(note.Content);
        
        var delCmd = conn.CreateCommand();
        delCmd.CommandText = "DELETE FROM Links WHERE SourceId=@id";
        delCmd.Parameters.AddWithValue("@id", note.Id);
        delCmd.ExecuteNonQuery();

        foreach (var link in links)
        {
            var targetCmd = conn.CreateCommand();
            targetCmd.CommandText = "SELECT Id FROM Notes WHERE Title=@title";
            targetCmd.Parameters.AddWithValue("@title", link);
            var targetId = targetCmd.ExecuteScalar();
            
            if (targetId != null)
            {
                var insCmd = conn.CreateCommand();
                insCmd.CommandText = "INSERT OR IGNORE INTO Links (SourceId, TargetId) VALUES (@source, @target)";
                insCmd.Parameters.AddWithValue("@source", note.Id);
                insCmd.Parameters.AddWithValue("@target", targetId);
                insCmd.ExecuteNonQuery();
            }
        }
    }

    private List<string> ExtractLinks(string content)
    {
        var links = new List<string>();
        var matches = Regex.Matches(content, @"\[\[([^\]]+)\]\]");
        foreach (Match match in matches)
            links.Add(match.Groups[1].Value);
        return links;
    }

    public GraphData GetGraphData()
    {
        var notes = GetAllNotes();
        var links = new List<Link>();
        
        using var conn = new SqliteConnection(connectionString);
        conn.Open();
        var cmd = conn.CreateCommand();
        cmd.CommandText = "SELECT SourceId, TargetId FROM Links";
        using var reader = cmd.ExecuteReader();
        while (reader.Read())
            links.Add(new Link { SourceId = reader.GetInt32(0), TargetId = reader.GetInt32(1) });

        return new GraphData { Nodes = notes.ToArray(), Links = links.ToArray() };
    }

    public async System.Threading.Tasks.Task SyncFromMongoDBAsync()
    {
        try
        {
            // Get all notes from MongoDB
            var mongoNotes = await _mongoService.GetAllNotesAsync();
            var mongoLinks = await _mongoService.GetAllLinksAsync();

            using var conn = new SqliteConnection(connectionString);
            conn.Open();

            // Sync notes
            foreach (var mongoNote in mongoNotes)
            {
                var cmd = conn.CreateCommand();
                cmd.CommandText = "SELECT Id FROM Notes WHERE Id=@id";
                cmd.Parameters.AddWithValue("@id", mongoNote.LocalId);
                var exists = cmd.ExecuteScalar();

                if (exists == null)
                {
                    // Insert new note
                    var insertCmd = conn.CreateCommand();
                    insertCmd.CommandText = @"INSERT INTO Notes (Id, Title, Content, CreatedAt, UpdatedAt) 
                                             VALUES (@id, @title, @content, @created, @updated)";
                    insertCmd.Parameters.AddWithValue("@id", mongoNote.LocalId);
                    insertCmd.Parameters.AddWithValue("@title", mongoNote.Title);
                    insertCmd.Parameters.AddWithValue("@content", mongoNote.Content);
                    insertCmd.Parameters.AddWithValue("@created", mongoNote.CreatedAt.ToString("o"));
                    insertCmd.Parameters.AddWithValue("@updated", mongoNote.UpdatedAt.ToString("o"));
                    insertCmd.ExecuteNonQuery();
                }
                else
                {
                    // Update existing note if MongoDB version is newer
                    var updateCmd = conn.CreateCommand();
                    updateCmd.CommandText = @"UPDATE Notes 
                                             SET Title=@title, Content=@content, UpdatedAt=@updated 
                                             WHERE Id=@id AND UpdatedAt < @updated";
                    updateCmd.Parameters.AddWithValue("@id", mongoNote.LocalId);
                    updateCmd.Parameters.AddWithValue("@title", mongoNote.Title);
                    updateCmd.Parameters.AddWithValue("@content", mongoNote.Content);
                    updateCmd.Parameters.AddWithValue("@updated", mongoNote.UpdatedAt.ToString("o"));
                    updateCmd.ExecuteNonQuery();
                }
            }

            // Sync links
            foreach (var mongoLink in mongoLinks)
            {
                var cmd = conn.CreateCommand();
                cmd.CommandText = "INSERT OR IGNORE INTO Links (SourceId, TargetId) VALUES (@source, @target)";
                cmd.Parameters.AddWithValue("@source", mongoLink.SourceId);
                cmd.Parameters.AddWithValue("@target", mongoLink.TargetId);
                cmd.ExecuteNonQuery();
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"MongoDB sync error: {ex.Message}");
        }
    }
}
