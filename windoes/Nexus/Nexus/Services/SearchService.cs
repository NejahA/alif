using Microsoft.Data.Sqlite;
using Nexus.Models;
using System.Collections.Generic;

namespace Nexus.Services;

public class SearchService
{
    private readonly string connectionString;

    public SearchService(string connectionString)
    {
        this.connectionString = connectionString;
    }

    public List<Note> Search(string query)
    {
        var results = new List<Note>();
        using var conn = new SqliteConnection(connectionString);
        conn.Open();
        
        var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            SELECT n.* FROM Notes n
            JOIN NotesSearch ns ON n.Id = ns.rowid
            WHERE NotesSearch MATCH @query
            ORDER BY rank";
        cmd.Parameters.AddWithValue("@query", query);
        
        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            results.Add(new Note
            {
                Id = reader.GetInt32(0),
                Title = reader.GetString(1),
                Content = reader.GetString(2)
            });
        }
        return results;
    }
}
