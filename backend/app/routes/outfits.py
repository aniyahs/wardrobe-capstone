from flask import Blueprint, request, jsonify
from .outfitGenerator import generate_outfit_cps, clothingTypes, defaultWardrobeItems
from app.database import outfit_collection, wardrobe_collection
from datetime import datetime
from bson import ObjectId

# Create a blueprint for the outfit route
outfit_bp = Blueprint('outfit_bp', __name__)

def map_outfit_to_slots(outfit_list):
    # Initialize slots with default black if missing.
    slots = {
        "top": None,
        "layer1": None,
        "layer2": None,
        "bottom": None,
        "footwear": None,
        "accessory": None
    }

    # Iterate through each clothing item in outfit_list
    for item in outfit_list:
        type_lower = item["type"]

        if type_lower in clothingTypes["tops"]:
            if slots["top"] is None:
                slots["top"] = item
            elif slots["layer1"] is None:
                slots["layer1"] = item
            elif slots["layer2"] is None:
                slots["layer2"] = item

        elif type_lower in clothingTypes["bottoms"]:
            slots["bottom"] = item

        elif type_lower in clothingTypes["footwear"]:
            slots["footwear"] = item

        elif type_lower in clothingTypes["accessories"]:
            slots["accessory"] = item

        elif type_lower in clothingTypes["outerwear"]:
            if slots["layer1"] is None:
                slots["layer1"] = item
            elif slots["layer2"] is None:
                slots["layer2"] = item

    return slots

# Route for generating outfit
@outfit_bp.route('/generate-outfit', methods=['POST'])
def generate_outfit():
    data = request.get_json()
    season = data.get('season', 'Spring')
    if isinstance(season, str):
        season = [season]
    formality = data.get('formality', 'Casual')
    wardrobeItems = data.get('clothingItems') 
    if not wardrobeItems or not isinstance(wardrobeItems, list):
        return jsonify({"error": "Invalid clothing items"}), 400
    temperature = data.get("temperature", 72)  
    weathercode = data.get("weathercode", 1)
    userId = data.get("userId") 
    # Ensure season is a list.
    if isinstance(season, str):
        season = [season]
    try:
        outfit_list = generate_outfit_cps(season, formality, wardrobeItems, temperature,weathercode, userId)
        if outfit_list is None:
            return jsonify({"error": "No valid outfit found"}), 400
        slots = map_outfit_to_slots(outfit_list)
        return jsonify(outfit_list)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Route for saving an outfit 
@outfit_bp.route('/save-outfit', methods=["POST"])
def save_outfit():
    data = request.json
    user_id = data.get("userId")
    items = data.get("items")
    season = data.get("season")
    formality = data.get("formality")

    if not user_id or not items:
        return jsonify({"error": "Missing userId or Items"}), 400
    outfit_doc = {
        "userId": user_id, 
        "items": items, 
        "season": season, 
        "formality": formality, 
        "savedAt": datetime.utcnow()
    }
    result = outfit_collection.insert_one(outfit_doc)
    return jsonify({"message": "Outfit Saved", "outfitId": str(result.inserted_id)}), 201

# Route to get saved outfits
@outfit_bp.route('/saved', methods=['GET'])
def get_saved_outfits():
    user_id = request.args.get("userId")
    if not user_id:
        return jsonify({"error": "Missing userId"}), 400

    outfits = outfit_collection.find({"userId": user_id}).sort("savedAt", -1)
    outfit_list = []
    for outfit in outfits:
        outfit["_id"] = str(outfit["_id"])
        outfit_list.append(outfit)
    return jsonify(outfit_list), 200

# Route to delete a saved outfit 
@outfit_bp.route('/delete/<outfit_id>', methods=['DELETE'])
def delete_outfit(outfit_id):
    try:
        result = outfit_collection.delete_one({"_id": ObjectId(outfit_id)})
        if result.deleted_count == 0:
            return jsonify({"error": "Outfit not found"}), 404
        return jsonify({"message": "Outfit deleted"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
# Route to mark an outfit as 'worn'
@outfit_bp.route('/mark-worn/<outfit_id>', methods=['PATCH'])
def mark_outfit_as_worn(outfit_id):
    try:
        outfit = outfit_collection.find_one({"_id": ObjectId(outfit_id)})
        if not outfit:
            return jsonify({"error": "Outfit not found"}), 404

        # Increment for analytics 
        for item in outfit.get("items", []):
            wardrobe_collection.update_one(
                {"_id": ObjectId(item["_id"])},
                {
                    "$inc": {"wearCount": 1},
                    "$set": {"lastWornDate": datetime.utcnow()}
                }
            )
        outfit_collection.update_one(
            {"_id": ObjectId(outfit_id)},
            {"$push": {"wearLog": datetime.utcnow()}}
        )
        return jsonify({"message": "Outfit wear logged"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
# Route to get analytics set up
@outfit_bp.route("/analytics", methods=["GET"])
def outfit_analytics():
    from app.database import wardrobe_collection, outfit_collection

    user_id = request.args.get("userId")
    if not user_id:
        return jsonify({"error": "Missing userId"}), 400

    # Get all wardrobe items
    wardrobe_items = list(wardrobe_collection.find({"userId": user_id}))
    for item in wardrobe_items:
        item["_id"] = str(item["_id"])

    # Get all saved outfits
    outfits = list(outfit_collection.find({"userId": user_id}))

    # Build usage stats
    usage_count = {}
    color_count_by_type = {}
    season_usage = {}

    for outfit in outfits:
        for item in outfit.get("items", []):
            item_id = str(item["_id"])
            usage_count[item_id] = usage_count.get(item_id, 0) + 1

            item_type = item.get("type", "Unknown")
            color = item.get("color", "#000000")

            # Count colors by type
            if item_type not in color_count_by_type:
                color_count_by_type[item_type] = {}
            color_count_by_type[item_type][color] = color_count_by_type[item_type].get(color, 0) + 1

        for season in outfit.get("season", []):
            season_usage[season] = season_usage.get(season, 0) + 1

    # Organize most worn items by type
    most_worn_by_type = {}
    for item in wardrobe_items:
        item_id = item["_id"]
        item_type = item.get("type", "Unknown")
        item["wearCount"] = usage_count.get(item_id, 0)

        if item_type not in most_worn_by_type:
            most_worn_by_type[item_type] = []
        most_worn_by_type[item_type].append(item)

    for item_type in most_worn_by_type:
        most_worn_by_type[item_type].sort(key=lambda x: x["wearCount"], reverse=True)

    # Determine unworn items
    used_ids = set(usage_count.keys())
    unworn_items = [item for item in wardrobe_items if item["_id"] not in used_ids]

    return jsonify({
        "mostWornByType": most_worn_by_type,
        "mostUsedColors": color_count_by_type,
        "usageCounts": usage_count,
        "seasonUsage": season_usage,
        "unwornItems": unworn_items,
    })
