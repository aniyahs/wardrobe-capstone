# MongoDB connection setup
from pymongo import MongoClient
from pymongo.server_api import ServerApi
import os
from dotenv import load_dotenv

load_dotenv()

# Replace with your MongoDB Atlas connection string
MONGO_URI = os.getenv("MONGO_URI")

client = MongoClient(MONGO_URI)
db = client["WardrobeManager"] 

# Collections
users_collection = db["users"]
wardrobe_collection = db["wardrobe_items"]
outfit_collection = db["outfits"]

# Send a ping to confirm a successful connection
try:
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(e)



