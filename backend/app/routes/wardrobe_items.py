# wardrobe-realted routes
from flask import Blueprint, request, jsonify, session
from app.database import wardrobe_collection
from bson import ObjectId
from auth import login_required

wardrobe_bp = Blueprint("wardrobe", __name__)

# Add a new wardrobe item 
@wardrobe_bp.route("/add-item", methods=["POST"])
@login_required
def add_item():
    data = request.json
    
    item = {
        "user_id": data["user_id"], 
        "name": data["name"],
        "category": data["category"],
        "color": data["color"],
        "size": data["size"],
        "season": data["season"],
        "image_url": data["image_url"],
        "tags": data.get("tags", []) 
    }
    
    result = wardrobe_collection.insert_one(item)
    return jsonify({"message": "Item added", "item_id": str(result.inserted_id)}), 201

# Get a specific wardrobe item by ID
@wardrobe_bp.route("/<item_id>", methods=["GET"])
@login_required
def get_wardrobe_item(item_id):
    user_id = session.get("user_id")
    item = wardrobe_collection.find_one({"_id": ObjectId(item_id), "user_id": user_id})

    if not item:
        return jsonify({"error": "Item not found"}), 404

    item["_id"] = str(item["_id"])
    return jsonify(item), 200

# Update a wardrobe item 
@wardrobe_bp.route("/<item_id>", methods=["PUT"])
@login_required
def update_wardrobe_item(item_id):
    user_id = session.get("user_id")
    data = request.json

    updated_item = wardrobe_collection.find_one_and_update(
        {"_id": ObjectId(item_id), "user_id": user_id},
        {"$set": data},
        return_document=True
    )

    if not updated_item:
        return jsonify({"error": "Item not found or not authorized to update"}), 404

    updated_item["_id"] = str(updated_item["_id"])
    return jsonify({"message": "Item updated", "updated_item": updated_item}), 200

# Delete a wardrobe item 
@wardrobe_bp.route("/<item_id>", methods=["DELETE"])
@login_required
def delete_wardrobe_item(item_id):
    user_id = session.get("user_id")
    deleted_item = wardrobe_collection.find_one_and_delete(
        {"_id": ObjectId(item_id), "user_id": user_id}
    )

    if not deleted_item:
        return jsonify({"error": "Item not found or not authorized to delete"}), 404

    return jsonify({"message": "Item deleted successfully"}), 200
