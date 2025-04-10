from flask import Blueprint, request, jsonify
from .outfitGenerator import generate_outfit_cps, clothingTypes, defaultWardrobeItems

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
