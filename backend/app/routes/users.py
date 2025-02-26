from flask import Blueprint, request, jsonify, session
from app.database import users_collection
from werkzeug.security import generate_password_hash, check_password_hash
from pymongo.errors import DuplicateKeyError
from flask_cors import CORS

# Create a Flask Blueprint for user routes
users_bp = Blueprint("users", __name__)
CORS(users_bp) # should allow frontend requests

# endpoint to create an account 
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

# endpoint to allow users to login with an existing account 
@users_bp.route("/login", methods=["POST"])
def login_user():
    print("Login endpoint hit")  # Debugging line
    data = request.json
    user = users_collection.find_one({"email": data["email"]})

    if user and check_password_hash(user["password"], data["password"]):
        session["user_id"] = str(user["_id"])  # Store user session
        return jsonify({"message": "Login successful", "user_id": session["user_id"]}), 200
    else:
        return jsonify({"error": "Invalid email or password"}), 401
    
# endpoint for logging out 
@users_bp.route("/logout", methods=["POST"])
def logout_user():
    session.clear()  # Clears session data
    return jsonify({"message": "Logged out successfully"}), 200
