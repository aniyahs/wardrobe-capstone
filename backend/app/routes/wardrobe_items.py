# wardrobe-realted routes
from flask import Blueprint, request, jsonify
from app.database import wardrobe_collection

wardrobe_bp = Blueprint("wardrobe", __name__)

@wardrobe_bp.route("/add-item", methods=["POST"])
def add_item():
    data = request.json
    
    item = {
        "user_id": data["user_id"],  # Associate with a user
        "name": data["name"],
        "category": data["category"],
        "color": data["color"],
        "size": data["size"],
        "season": data["season"],
        "image_url": data["image_url"],
        "tags": data.get("tags", [])  # Optional tags
    }
    
    result = wardrobe_collection.insert_one(item)
    return jsonify({"message": "Item added", "item_id": str(result.inserted_id)}), 201
