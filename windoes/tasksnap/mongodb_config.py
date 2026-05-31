"""
MongoDB Configuration for dought
Place your MongoDB Atlas credentials here
"""

# MongoDB Atlas connection string
# Format: mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
MONGODB_URI = "mongodb+srv://achrefhamdi:21960975@cluster0.qd9v5k1.mongodb.net/?retryWrites=true&w=majority"

# Database and collection names
DATABASE_NAME = "dought"
COLLECTION_NAME = "tasks"

# Set to True to enable MongoDB sync, False to use local file only
ENABLE_MONGODB = True
