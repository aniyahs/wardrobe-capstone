from flask import Blueprint, request, jsonify
from database import users_collection
from werkzeug.security import generate_password_hash
from pymongo.errors import DuplicateKeyError

# Create a Flask Blueprint for user routes
users_bp = Blueprint("users", __name__)

@users_bp.route("/register", methods=["POST"])
def register_user():
    data = request.json

    # Check if email already exists
    existing_user = users_collection.find_one({"email": data["email"]})
    if existing_user:
        return jsonify({"error": "Email already registered"}), 400

    # Hash the password before storing
    hashed_password = generate_password_hash(data["password"])
    
    user = {
        "username": data["username"],
        "email": data["email"],
        "password": hashed_password,
        "wardrobe": []  # Empty wardrobe initially
    }
    
    users_collection.insert_one(user)
    return jsonify({"message": "User created successfully"}), 201
