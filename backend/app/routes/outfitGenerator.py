from .sampleWardrobe import clothingTypes, defaultWardrobeItems
from itertools import product
import random

# -------------------------
# Helper Functions
# -------------------------

def hexToHSV(clothes):
    color = clothes.get("color", "").lstrip("#")

    # Validate length and characters
    if len(color) != 6 or not all(c in "0123456789abcdefABCDEF" for c in color):
        raise ValueError(f"Invalid hex color: '{clothes.get('color')}'")

    r, g, b = [int(color[i:i+2], 16) for i in (0, 2, 4)]
    r_norm, g_norm, b_norm = r / 255.0, g / 255.0, b / 255.0
    c_max = max(r_norm, g_norm, b_norm)
    c_min = min(r_norm, g_norm, b_norm)
    delta = c_max - c_min

    if delta == 0:
        h = 0
    elif c_max == r_norm:
        h = ((g_norm - b_norm) / delta) % 6
    elif c_max == g_norm:
        h = ((b_norm - r_norm) / delta) + 2
    else:
        h = ((r_norm - g_norm) / delta) + 4

    h = round(h * 60)
    if h < 0:
        h += 360
    s = 0 if c_max == 0 else (delta / c_max) * 100
    v = c_max * 100
    return round(h, 2), round(s, 2), round(v, 2)


def isNeutral(h, s, v):
    if v < 12 or v > 88: 
        if s < 15:
            return True   
    return False

def calculate_average_color(items):
    r, g, b = 0, 0, 0
    for item in items:
        color = item['color']
        r += int(color[1:3], 16)
        g += int(color[3:5], 16)
        b += int(color[5:7], 16)
    num_items = len(items)
    return (r // num_items, g // num_items, b // num_items)

def color_contrast(color1, color2):
    r1, g1, b1 = color1
    r2, g2, b2 = color2
    return ((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2) ** 0.5

def is_colorful(item):
    h, s, v = hexToHSV(item)
    return not isNeutral(h, s, v)

def get_seasons_match(item, seasons):
    return any(season in item['season'] for season in seasons)

def max_three_colors(outfit):
    colors = set(item['color'] for item in outfit)
    return len(colors) <= 3

def avoid_monochrome(outfit):
    colors = set(item['color'] for item in outfit)
    return len(colors) > 1 or "black" in colors

def check_layers(outfit):
    top_items = [item for item in outfit if item['type'] in clothingTypes['tops'] or item['type'] in clothingTypes['outerwear']]
    return len(top_items) <= 3

def no_socks_with_sandals_or_heels(outfit):
    has_socks = any(item['type'] == 'Socks' for item in outfit)
    has_sandals_or_heels = any(item['type'] in ['Sandals', 'Heels'] for item in outfit)
    return not (has_socks and has_sandals_or_heels)

def avoid_complementary_colors(outfit):
    for item in outfit:
        h, s, v = hexToHSV(item)
        complementary_hue = (h + 180) % 360
        for other_item in outfit:
            if item != other_item:
                other_h, other_s, other_v = hexToHSV(other_item)
                if (complementary_hue - other_h) % 360 < 20:
                    return False
    return True

def best_match_color(outfit):
    for item in outfit:
        h, s, v = hexToHSV(item)
        analogous_hues = [(h + 30) % 360, (h + 60) % 360]
        for other_item in outfit:
            other_h, other_s, other_v = hexToHSV(other_item)
            if other_h in analogous_hues:
                return True
    return False

def all_unique(*args):
    non_none = [x for x in args if x is not None]
    return len(non_none) == len(set(id(x) for x in non_none))

def is_valid_hex_color(color):
    return isinstance(color, str) and color.startswith("#") and len(color) == 7

# -------------------------
# Outfit Generator
# -------------------------

def generate_outfit_cps(season, formality, wardrobeItems, temperature=None, weathercode=None, userId=None):
    wardrobeItems = [
    item for item in wardrobeItems
    if is_valid_hex_color(item.get("color", ""))
]
    # Do something

    tops_candidates = [item for item in wardrobeItems if item['type'] == 'Tops']
    bottoms_candidates = [item for item in wardrobeItems if item['type'] == 'Bottoms']
    footwear_candidates = [item for item in wardrobeItems if item['type'] == 'Footwear']
    accessories_candidates = [item for item in wardrobeItems if item['type'] == 'Accessories']
    layering_candidates = [item for item in wardrobeItems if item['type'] in ['Tops', 'Outerwear']]

    layer1_candidates = [None] + layering_candidates
    layer2_candidates = [None] + layering_candidates
    accessory_candidates = [None] + accessories_candidates

    if not tops_candidates or not bottoms_candidates or not footwear_candidates:
        print("Tops:", [item["style"] for item in tops_candidates])
        print("Bottoms:", [item["style"] for item in bottoms_candidates])
        print("Footwear:", [item["style"] for item in footwear_candidates])

        raise ValueError("Missing essential clothing items.")

    variables = ['top', 'layer1', 'layer2', 'bottom', 'footwear', 'accessory']
    candidates = {
        'top': tops_candidates,
        'layer1': layer1_candidates,
        'layer2': layer2_candidates,
        'bottom': bottoms_candidates,
        'footwear': footwear_candidates,
        'accessory': accessory_candidates
    }

    def outfit_from_assignment(assignment):
        return [
            assignment['top'],
            *(item for item in [assignment['layer1'], assignment['layer2']] if item),
            assignment['bottom'],
            assignment['footwear'],
            *(item for item in [assignment['accessory']] if item)
        ]

    def calculate_penalty(assignment):
        outfit = outfit_from_assignment(assignment)
        penalty = 0

        penalties = []

        if not all_unique(*assignment.values()):
            penalty += 10
            penalties.append("Duplicate items found.")
        if not max_three_colors(outfit): 
            penalty += 1
            penalties.append("More than 3 colors in outfit.")
        if not avoid_monochrome(outfit): 
            penalty += 1
            penalties.append("Monochrome outfit detected.")
        if not check_layers(outfit): 
            penalty += 1
            penalties.append("Too many layers.")
        if not no_socks_with_sandals_or_heels(outfit): 
            penalty += 1
            penalties.append("Socks with sandals or heels.")
        if not avoid_complementary_colors(outfit): 
            penalty += 1
            penalties.append("Complementary colors detected.")
        if not best_match_color(outfit): 
            penalty += 1
            penalties.append("No best match color found.")

        temp_season = False
        temp_formality = False

        for item in outfit:
            if not get_seasons_match(item, season): 
                penalty += 10
                temp_season = True
            if item['formality'] != formality: 
                penalty += 10
                temp_formality = True

        if temp_season: 
            penalties.append("Season mismatch detected.")
        if temp_formality: 
            penalties.append("Formality mismatch detected.")

        # 🧥 Require base layer if under 50°F
        if temperature is not None and temperature < 50:
            has_layer = any(i['type'] in clothingTypes['outerwear'] for i in outfit)
            if not has_layer:
                penalty += 5

        # ☀️ Penalize layers if over 75°F
        if temperature is not None and temperature > 75:
            layers = [i for i in outfit if i['type'] in clothingTypes['outerwear']]
            penalty += len(layers) * 5

        # 🌫 Prefer cooler tones on overcast/fog
        if weathercode in [3, 45, 48]:
            for item in outfit:
                h, _, _ = hexToHSV(item)
                if not (180 <= h <= 300):
                    penalty += 1

        # ☀️ Prefer warm tones on sunny
        if weathercode in [0, 1, 2]:
            for item in outfit:
                h, _, _ = hexToHSV(item)
                if not (h <= 60 or h >= 300):
                    penalty += 1

        return penalty, penalties

    def partial_penalty(assignment):
        penalty = 0
        assigned = [assignment.get(var) for var in variables if assignment.get(var)]
        if len(set(id(x) for x in assigned)) != len(assigned):
            penalty += 10

        for item in assigned:
            if not get_seasons_match(item, season): penalty += 10
            if item['formality'] != formality: penalty += 10

        if len({x['color'] for x in assigned}) > 3: penalty += 1

        types = {x['type'] for x in assigned}
        if 'Socks' in types and ('Sandals' in types or 'Heels' in types): penalty += 1
        if any(x['type'] == 'Heels' for x in assigned) and assignment.get('bottom', {}).get('type') != 'Skirt':
            penalty += 1

        return penalty

    best_solution = None
    best_penalty = float('inf')
    penalties = []

    def backtrack(index, current_assignment):
        nonlocal best_solution, best_penalty, penalties
        if index == len(variables):
            pen, temp_penalties = calculate_penalty(current_assignment)
            if pen < best_penalty:
                best_penalty = pen
                best_solution = current_assignment.copy()
                penalties = temp_penalties
            return

        var = variables[index]
        for item in candidates[var]:
            current_assignment[var] = item
            if partial_penalty(current_assignment) <= best_penalty:
                backtrack(index + 1, current_assignment)
            del current_assignment[var]

    backtrack(0, {})

    if best_solution:
        final_outfit = outfit_from_assignment(best_solution)

        print("------------------------------")
        print(f"Penalty: {best_penalty}")
        print()

        for item in final_outfit:
            if item is None:
                continue
            style = item.get("style", "Unknown")
            item_id = item.get("_id", "N/A")
            print(f"{style}: {item_id}")

        print()
        for reason in penalties:
            print(f"- {reason}")
        print()
        return final_outfit
    else:
        print("No outfit found.")
        return None
