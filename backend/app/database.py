# MongoDB connection setup
from pymongo import MongoClient
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

print("Connected to MongoDB!")




