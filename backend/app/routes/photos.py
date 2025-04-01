from flask import Blueprint, request, jsonify
from app.database import db
from datetime import datetime

photos_bp = Blueprint("photos", __name__)
photos_collection = db["photos"]

@photos_bp.route("/", methods=["POST"])
def save_photo_url():
    data = request.json
    user_id = data.get("userId")
    photo_url = data.get("photoUrl")

    if not user_id or not photo_url:
        return jsonify({"message": "Missing userId or photoUrl"}), 400

    photo_doc = {
        "userId": user_id,
        "photoUrl": photo_url,
        "uploadedAt": datetime.utcnow()
    }

    try:
        result = photos_collection.insert_one(photo_doc)
        return jsonify({"message": "Photo saved successfully!", "photo_id": str(result.inserted_id)}), 201
    except Exception as e:
        return jsonify({"message": "Failed to save photo", "error": str(e)}), 500
