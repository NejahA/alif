using MongoDB.Driver;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Nexus.Models;

namespace Nexus.Services
{
    public class MongoNote
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }
        
        [BsonElement("localId")]
        public int LocalId { get; set; }
        
        [BsonElement("title")]
        public string Title { get; set; } = string.Empty;
        
        [BsonElement("content")]
        public string Content { get; set; } = string.Empty;
        
        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; }
        
        [BsonElement("updatedAt")]
        public DateTime UpdatedAt { get; set; }
    }

    public class MongoLink
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }
        
        [BsonElement("sourceId")]
        public int SourceId { get; set; }
        
        [BsonElement("targetId")]
        public int TargetId { get; set; }
    }

    public class MongoDbService
    {
        private readonly IMongoDatabase _database;
        private readonly IMongoCollection<MongoNote> _notesCollection;
        private readonly IMongoCollection<MongoLink> _linksCollection;
        private System.Threading.Timer? _syncTimer;
        public event EventHandler? DataChanged;

        public MongoDbService()
        {
            var connectionString = "mongodb+srv://achrefhamdi:21960975@cluster0.qd9v5k1.mongodb.net/nexus_db?retryWrites=true&w=majority";
            var client = new MongoClient(connectionString);
            _database = client.GetDatabase("nexus_db");
            _notesCollection = _database.GetCollection<MongoNote>("notes");
            _linksCollection = _database.GetCollection<MongoLink>("links");
            
            // Start auto-sync timer (every 3 seconds)
            StartAutoSync();
        }

        public void StartAutoSync()
        {
            _syncTimer = new System.Threading.Timer(
                callback: _ => DataChanged?.Invoke(this, EventArgs.Empty),
                state: null,
                dueTime: TimeSpan.FromSeconds(3),
                period: TimeSpan.FromSeconds(3)
            );
        }

        public void StopAutoSync()
        {
            _syncTimer?.Dispose();
        }

        // Notes operations
        public async Task<List<MongoNote>> GetAllNotesAsync()
        {
            return await _notesCollection.Find(_ => true).ToListAsync();
        }

        public async Task SyncNoteAsync(Note note)
        {
            var mongoNote = new MongoNote
            {
                LocalId = note.Id,
                Title = note.Title,
                Content = note.Content,
                CreatedAt = note.CreatedAt,
                UpdatedAt = note.UpdatedAt
            };

            var filter = Builders<MongoNote>.Filter.Eq(n => n.LocalId, note.Id);
            var existing = await _notesCollection.Find(filter).FirstOrDefaultAsync();

            if (existing != null)
            {
                mongoNote.Id = existing.Id;
                await _notesCollection.ReplaceOneAsync(filter, mongoNote);
            }
            else
            {
                await _notesCollection.InsertOneAsync(mongoNote);
            }
        }

        public async Task DeleteNoteAsync(int localId)
        {
            var filter = Builders<MongoNote>.Filter.Eq(n => n.LocalId, localId);
            await _notesCollection.DeleteOneAsync(filter);
        }

        // Links operations
        public async Task<List<MongoLink>> GetAllLinksAsync()
        {
            return await _linksCollection.Find(_ => true).ToListAsync();
        }

        public async Task SyncLinkAsync(int sourceId, int targetId)
        {
            var mongoLink = new MongoLink
            {
                SourceId = sourceId,
                TargetId = targetId
            };

            var filter = Builders<MongoLink>.Filter.And(
                Builders<MongoLink>.Filter.Eq(l => l.SourceId, sourceId),
                Builders<MongoLink>.Filter.Eq(l => l.TargetId, targetId)
            );

            var existing = await _linksCollection.Find(filter).FirstOrDefaultAsync();
            if (existing == null)
            {
                await _linksCollection.InsertOneAsync(mongoLink);
            }
        }

        public async Task DeleteLinkAsync(int sourceId, int targetId)
        {
            var filter = Builders<MongoLink>.Filter.And(
                Builders<MongoLink>.Filter.Eq(l => l.SourceId, sourceId),
                Builders<MongoLink>.Filter.Eq(l => l.TargetId, targetId)
            );
            await _linksCollection.DeleteOneAsync(filter);
        }

        public async Task<bool> TestConnectionAsync()
        {
            try
            {
                await _database.RunCommandAsync((Command<BsonDocument>)"{ping:1}");
                return true;
            }
            catch
            {
                return false;
            }
        }
    }
}
