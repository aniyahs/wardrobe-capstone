# configuration setup (env varibles)
from pymongo import MongoClient
import os

MONGO_URI = os.getenv("MONGO_URI", "mongodb+srv://AniyahShirehjini:DBWardrobeManager@wardrobemanager.hb4bj.mongodb.net/")
client = MongoClient(MONGO_URI)
db = client["wardrobe_manager"]

users_collection = db["users"]
wardrobe_collection = db["wardrobes"]