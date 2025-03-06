from flask import Blueprint, request, jsonify, session
from app.database import users_collection
from werkzeug.security import generate_password_hash, check_password_hash
from pymongo.errors import DuplicateKeyError
from flask_cors import CORS
from functools import wraps
from bson import ObjectId
#from auth import login_required
#from app.routes.auth import login_required


# Create a Flask Blueprint for user routes
users_bp = Blueprint("users", __name__)
CORS(users_bp) # should allow frontend requests

# Endpoint to create an account
@users_bp.route("/register", methods=["POST"])
def register_user():
    data = request.json

    # Validate input
    if not data.get("username") or not data.get("email") or not data.get("password"):
        return jsonify({"error": "Missing username, email, or password"}), 400

    # Check if email already exists
    existing_user = users_collection.find_one({"email": data["email"]})
    if existing_user:
        return jsonify({"error": "Email already registered"}), 400

    # Check if username already exists
    existing_username = users_collection.find_one({"username": data["username"]})
    if existing_username:
        return jsonify({"error": "Username already taken"}), 400

    # Hash the password before storing
    hashed_password = generate_password_hash(data["password"])
    
    user = {
        "username": data["username"],  # Use `username` instead of `name`
        "email": data["email"],  # Store email
        "password": hashed_password,  # Store hashed password
        "wardrobe": []  # Empty wardrobe initially
    }
    
    users_collection.insert_one(user)
    return jsonify({"message": "User created successfully!"}), 201

# Endpoint to allow users to login with an existing account
@users_bp.route("/login", methods=["POST"])
def login_user():
    data = request.json

    # Validate input
    if not data.get("email") or not data.get("password"):
        return jsonify({"error": "Missing email or password"}), 400

    # Try to find the user by email
    user = users_collection.find_one({"email": data["email"]})

    if not user:
        return jsonify({"error": "User not found"}), 404

    # Check if the password is correct
    if not check_password_hash(user["password"], data["password"]):
        return jsonify({"error": "Invalid password"}), 401

    # Return success and user details
    return jsonify({"message": "Login successful", "user_id": str(user["_id"]), "username": user["username"]}), 200

    
# Endpoint for logging out 
@users_bp.route("/logout", methods=["POST"])
def logout_user():
    session.pop("user_id", None)  # Remove user session
    return jsonify({"message": "Logout successful"}), 200

# Endpoint to fetch a users information (exclusing password for security)
@users_bp.route("/profile", methods=["GET"])
#@login_required  # Middleware to ensure the user is authenticated
def get_user_profile():
    user_id = session.get("user_id")  # Get the logged-in user's ID from the session
    
    # Fetch user data from MongoDB
    user = users_collection.find_one({"_id": ObjectId(user_id)}, {"password": 0})  # Exclude password field

    if not user:
        return jsonify({"error": "User not found"}), 404

    # Convert ObjectId to string for JSON serialization
    user["_id"] = str(user["_id"])

    return jsonify(user), 200  # Return the user's data

