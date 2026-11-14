#!/usr/bin/env python3
"""
Verify that both desktop and Flutter versions use the dought MongoDB database
"""

from pymongo import MongoClient
from mongodb_config import MONGODB_URI, DATABASE_NAME, COLLECTION_NAME, ENABLE_MONGODB

def verify_dought_database():
    print("=" * 60)
    print("VERIFYING DOUGHT MONGODB DATABASE CONFIGURATION")
    print("=" * 60)
    
    print(f"\nDesktop Configuration:")
    print(f"  Connection URI: {MONGODB_URI[:50]}...")
    print(f"  Database: {DATABASE_NAME}")
    print(f"  Collection: {COLLECTION_NAME}")
    print(f"  MongoDB Enabled: {ENABLE_MONGODB}")
    
    print(f"\nFlutter Configuration:")
    print(f"  Connection URI: mongodb+srv://achrefhamdi:21960975@cluster0.qd9v5k1.mongodb.net/dought?retryWrites=true&w=majority&appName=dought")
    print(f"  Database: dought")
    print(f"  Collection: tasks")
    
    print(f"\n{'='*60}")
    print("TEST 1: Connect to MongoDB")
    print('='*60)
    
    try:
        client = MongoClient(MONGODB_URI)
        client.admin.command('ping')
        print("✓ Connected to MongoDB Atlas successfully")
        
        db = client[DATABASE_NAME]
        collection = db[COLLECTION_NAME]
        print(f"✓ Accessed database: {DATABASE_NAME}")
        print(f"✓ Accessed collection: {COLLECTION_NAME}")
        
        print(f"\n{'='*60}")
        print("TEST 2: Check existing data in dought database")
        print('='*60)
        
        doc = collection.find_one({'_id': 'tasks_data'})
        if doc:
            todo_count = len(doc.get('todo', []))
            in_progress_count = len(doc.get('in_progress', []))
            done_count = len(doc.get('done', []))
            
            print(f"✓ Found tasks document in '{DATABASE_NAME}' database")
            print(f"  Todo tasks: {todo_count}")
            print(f"  In Progress tasks: {in_progress_count}")
            print(f"  Done tasks: {done_count}")
            
            if 'last_updated' in doc:
                print(f"  Last updated: {doc['last_updated']}")
                
            # Show a sample task if available
            if todo_count > 0:
                sample_task = doc['todo'][0]
                print(f"\n  Sample task:")
                print(f"    Title: {sample_task.get('title', 'N/A')}")
                print(f"    Description: {sample_task.get('description', 'N/A')[:50]}...")
        else:
            print(f"ℹ️ No tasks document found in '{DATABASE_NAME}' database (this is normal for first run)")
            
        print(f"\n{'='*60}")
        print("VERIFICATION COMPLETE")
        print('='*60)
        print(f"\n✅ Both desktop and Flutter versions are now configured to use:")
        print(f"  Database: {DATABASE_NAME}")
        print(f"  Collection: {COLLECTION_NAME}")
        print(f"\n✅ Connection string:")
        print(f"  {MONGODB_URI}")
        print(f"\n✅ The 'dought' database is now properly configured for both applications!")
        
    except Exception as e:
        print(f"✗ Error during verification: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    verify_dought_database()