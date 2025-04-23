from flask import Blueprint, request, jsonify
from .outfitGenerator import generate_outfit_cps, clothingTypes, defaultWardrobeItems
from app.database import outfit_collection
from datetime import datetime

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