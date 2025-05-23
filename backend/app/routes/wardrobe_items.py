# wardrobe-realted routes
from flask import Blueprint, request, jsonify, session
from app.database import wardrobe_collection
from bson import ObjectId

wardrobe_bp = Blueprint("wardrobe", __name__)

# Add a new wardrobe item 
@wardrobe_bp.route("/add-item", methods=["POST"])
def add_item():
    data = request.json
    item = {
    "userId": data["userId"],
    "photoUrl": data["photoUrl"],
    "type": data["type"],
    "style": data["style"],
    "color": data["color"],
    "texture": data["texture"],
    "season": data["season"],        
    "formality": data["formality"],
    "size": data["size"],
    "favorite": data["favorite"],     
}
    
    result = wardrobe_collection.insert_one(item)
    return jsonify({"message": "Item added", "item_id": str(result.inserted_id)}), 201

# Get a specific wardrobe item by ID
@wardrobe_bp.route("/<item_id>", methods=["GET"])
def get_wardrobe_item(item_id):
    user_id = session.get("user_id")
    item = wardrobe_collection.find_one({"_id": ObjectId(item_id), "user_id": user_id})

    if not item:
        return jsonify({"error": "Item not found"}), 404

    item["_id"] = str(item["_id"])
    return jsonify(item), 200

# Update a wardrobe item 
@wardrobe_bp.route("/<item_id>", methods=["PUT"])
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
@wardrobe_bp.route("/delete/<item_id>", methods=["DELETE"])
def delete_wardrobe_item(item_id):
    user_id = session.get("user_id")
    deleted_item = wardrobe_collection.find_one_and_delete(
        {"_id": ObjectId(item_id), "user_id": user_id}
    )

    if not deleted_item:
        return jsonify({"error": "Item not found or not authorized to delete"}), 404

    return jsonify({"message": "Item deleted successfully"}), 200

# Get all wardrobe items for a user 
@wardrobe_bp.route("/clothing", methods=["GET"])
def get_all_wardrobe_items():
    try:
        user_id = request.args.get("userId")
        if user_id:
            items = wardrobe_collection.find({"userId": user_id})
        else:
            items = wardrobe_collection.find()
        
        item_list = []
        for item in items:
            item["_id"] = str(item["_id"])
            item["imageUrl"] = item.get("image_url") or item.get("photoUrl") or ""
            item_list.append(item)
        return jsonify(item_list), 200
    except Exception as e:
        print("Error fetching wardrobe items:", e)
        return jsonify({"error": "Error fetching wardrobe items"}), 500
    
# Toggle favorite status
@wardrobe_bp.route("/<item_id>/favorite", methods=["PATCH"])
def toggle_favorite(item_id):
    data = request.get_json()
    new_favorite = data.get("favorite")

    if new_favorite is None:
        return jsonify({"error": "Missing 'favorite' in request body"}), 400

    result = wardrobe_collection.update_one(
        {"_id": ObjectId(item_id)},
        {"$set": {"favorite": new_favorite}}
    )

    if result.matched_count == 0:
        return jsonify({"error": "Item not found"}), 404

    return jsonify({"message": "Favorite status updated"}), 200


