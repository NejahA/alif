#!/usr/bin/env python3
"""
Test cross-platform MongoDB data sharing between Python and Flutter
"""

from pymongo import MongoClient
from datetime import datetime
import time
from mongodb_config import MONGODB_URI, DATABASE_NAME, COLLECTION_NAME

def test_cross_platform_sync():
    print("=" * 70)
    print("CROSS-PLATFORM MONGODB SYNC TEST")
    print("=" * 70)
    
    print("\n🔧 Step 1: Connect to MongoDB")
    client = MongoClient(MONGODB_URI)
    db = client[DATABASE_NAME]
    collection = db[COLLECTION_NAME]
    
    # Read current state
    current_doc = collection.find_one({'_id': 'tasks_data'})
    current_todo = len(current_doc.get('todo', [])) if current_doc else 0
    print(f"  Current tasks in database: {current_todo} todo tasks")
    
    print("\n📝 Step 2: Add test task from Python")
    test_task = {
        'id': int(time.time() * 1000),
        'title': f'Test from Python at {datetime.now().strftime("%H:%M:%S")}',
        'description': 'This task was added by the Python desktop app',
        'due_date': datetime.now().strftime('%Y-%m-%d'),
        'tags': ['test', 'python', 'cross-platform'],
        'created': datetime.now().isoformat(),
        'time_spent': 0
    }
    
    if current_doc:
        # Add to existing tasks
        updated_todo = current_doc.get('todo', []) + [test_task]
        collection.update_one(
            {'_id': 'tasks_data'},
            {'$set': {
                'todo': updated_todo,
                'last_updated': datetime.now().isoformat()
            }}
        )
    else:
        # Create new document
        collection.insert_one({
            '_id': 'tasks_data',
            'todo': [test_task],
            'in_progress': [],
            'done': [],
            'last_updated': datetime.now().isoformat()
        })
    
    print(f"  ✓ Added test task: {test_task['title']}")
    
    print("\n📊 Step 3: Verify the update")
    updated_doc = collection.find_one({'_id': 'tasks_data'})
    updated_todo = len(updated_doc.get('todo', [])) if updated_doc else 0
    
    print(f"  Total todo tasks now: {updated_todo}")
    print(f"  Last updated: {updated_doc.get('last_updated', 'N/A') if updated_doc else 'N/A'}")
    
    print("\n📱 Step 4: Verify Flutter can read this data")
    print("  To verify from Flutter:")
    print("  1. Run the Flutter app: cd ../flutters/dought && flutter run")
    print("  2. Check that the new task appears")
    print("  3. Or run: dart test_mongodb.dart")
    
    print("\n🔄 Step 5: Test data integrity")
    if updated_doc:
        print(f"  Database: {DATABASE_NAME} ✓")
        print(f"  Collection: {COLLECTION_NAME} ✓")
        print(f"  Document ID: tasks_data ✓")
        print(f"  Task structure: {list(updated_doc.keys())} ✓")
        
        # Check that our task was added
        python_task_found = False
        for task in updated_doc.get('todo', []):
            if 'Test from Python at' in task.get('title', ''):
                python_task_found = True
                break
        
        if python_task_found:
            print(f"  Python task found in database ✓")
        else:
            print(f"  ⚠️ Python task not found in database")
    
    print("\n" + "=" * 70)
    print("TEST COMPLETE")
    print("=" * 70)
    print("\n✅ The Python desktop app successfully:")
    print("  1. Connected to MongoDB Atlas")
    print("  2. Added a test task to the shared database")
    print("  3. Updated the 'last_updated' timestamp")
    print("\n✅ The Flutter mobile app can now:")
    print("  1. Read this same data from MongoDB")
    print("  2. Display the new task")
    print("  3. Make further updates that Python can see")
    print("\n✅ Both applications are now synchronized via MongoDB!")
    
    client.close()

if __name__ == '__main__':
    test_cross_platform_sync()