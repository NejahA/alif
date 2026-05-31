"""
Test MongoDB connection
"""
from pymongo import MongoClient
from mongodb_config import MONGODB_URI, DATABASE_NAME, COLLECTION_NAME

print("Testing MongoDB connection...")
print(f"Database: {DATABASE_NAME}")
print(f"Collection: {COLLECTION_NAME}")
print()

try:
    # Connect to MongoDB
    client = MongoClient(MONGODB_URI)
    
    # Test connection
    client.admin.command('ping')
    print("✓ MongoDB connection successful!")
    
    # List databases
    databases = client.list_database_names()
    print(f"✓ Available databases: {databases}")
    
    # Access dought database
    db = client[DATABASE_NAME]
    collection = db[COLLECTION_NAME]
    
    # Try to read existing data
    doc = collection.find_one({'_id': 'tasks_data'})
    if doc:
        print(f"✓ Found existing tasks data")
        print(f"  - Todo: {len(doc.get('todo', []))} tasks")
        print(f"  - In Progress: {len(doc.get('in_progress', []))} tasks")
        print(f"  - Done: {len(doc.get('done', []))} tasks")
    else:
        print("✓ No existing tasks data (this is normal for first run)")
    
    print()
    print("MongoDB is ready to use!")
    
except Exception as e:
    print(f"✗ MongoDB connection failed!")
    print(f"Error: {e}")
    print()
    print("Please check:")
    print("1. Your connection string in mongodb_config.py")
    print("2. Your network connection")
    print("3. MongoDB Atlas IP whitelist settings")
