from sampleWardrobe import clothingTypes, wardrobeItems
from constraint import Problem
from itertools import product
import random

# -------------------------
# Helper Functions
# -------------------------

def hexToHSV(clothes):
    color = clothes["color"].lstrip("#")
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
    elif c_max == b_norm:
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

def check_formality(outfit):
    formality = outfit[0]['formality']
    for item in outfit:
        if item['formality'] != formality:
            return False
    return True

def max_three_colors(outfit):
    colors = set(item['color'] for item in outfit)
    return len(colors) <= 3

def avoid_monochrome(outfit):
    colors = set(item['color'] for item in outfit)
    return len(colors) > 1 or "black" in colors

def check_layers(outfit):
    # Count items worn on top from either tops or outerwear.
    top_items = [item for item in outfit if item['type'] in clothingTypes['tops'] or item['type'] in clothingTypes['outerwear']]
    return len(top_items) <= 3

def no_socks_with_sandals_or_heels(outfit):
    has_socks = any(item['type'] == 'Socks' for item in outfit)
    has_sandals_or_heels = any(item['type'] in ['Sandals', 'Heels'] for item in outfit)
    return not (has_socks and has_sandals_or_heels)

def heels_require_skirt(outfit):
    has_heels = any(item['type'] == 'Heels' for item in outfit)
    has_skirt = any(item['type'] == 'Skirt' for item in outfit)
    return not has_heels or has_skirt

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

# New helper to ensure items are not duplicated.
def all_unique(*args):
    non_none = [x for x in args if x is not None]
    return len(non_none) == len(set(id(x) for x in non_none))

# -------------------------
# Constraint Programming Outfit Generator with "Closest Match" fallback
# -------------------------

def generate_outfit_cps(season, formality, wardrobeItems):
    problem = Problem()

    # Build candidate lists based on type and season.
    tops_candidates = [item for item in wardrobeItems 
                       if item['type'] in clothingTypes['tops'] and get_seasons_match(item, season)]
    bottoms_candidates = [item for item in wardrobeItems 
                          if item['type'] in clothingTypes['bottoms'] and get_seasons_match(item, season)]
    footwear_candidates = [item for item in wardrobeItems 
                           if item['type'] in clothingTypes['footwear'] and get_seasons_match(item, season)]
    accessories_candidates = [item for item in wardrobeItems 
                              if item['type'] in clothingTypes['accessories']]
    # Layering candidates come from tops and outerwear.
    layering_candidates = [item for item in wardrobeItems 
                           if (item['type'] in clothingTypes['tops'] or item['type'] in clothingTypes['outerwear']) 
                           and get_seasons_match(item, season)]
    
    # Optional candidates for layers and accessory.
    layer1_candidates = [None] + layering_candidates
    layer2_candidates = [None] + layering_candidates
    accessory_candidates = [None] + accessories_candidates

    # Debug prints.
    print("Tops candidates:", tops_candidates)
    print("Layering candidates:", layering_candidates)
    print("Bottoms candidates:", bottoms_candidates)
    print("Footwear candidates:", footwear_candidates)
    print("Accessories candidates:", accessory_candidates)

    # Check for empty mandatory domains.
    if not tops_candidates:
        raise ValueError("No valid tops available for the given season.")
    if not bottoms_candidates:
        raise ValueError("No valid bottoms available for the given season.")
    if not footwear_candidates:
        raise ValueError("No valid footwear available for the given season.")

    # Add variables.
    problem.addVariable('top', tops_candidates)
    problem.addVariable('layer1', layer1_candidates)
    problem.addVariable('layer2', layer2_candidates)
    problem.addVariable('bottom', bottoms_candidates)
    problem.addVariable('footwear', footwear_candidates)
    problem.addVariable('accessory', accessory_candidates)

    # Constraint: Ensure each selected item is unique (if not None).
    problem.addConstraint(all_unique, ['top', 'layer1', 'layer2', 'bottom', 'footwear', 'accessory'])

    # Helper to build the complete outfit.
    def outfit_from_solution(sol):
        outfit = []
        outfit.append(sol['top'])  # Mandatory top.
        if sol['layer1'] is not None:
            outfit.append(sol['layer1'])
        if sol['layer2'] is not None:
            outfit.append(sol['layer2'])
        outfit.append(sol['bottom'])  # Mandatory bottom.
        outfit.append(sol['footwear'])  # Mandatory footwear.
        if sol['accessory'] is not None:
            outfit.append(sol['accessory'])
        return outfit

    # Add constraints by wrapping existing validation functions.
    def constraint_max_three_colors(top, layer1, layer2, bottom, footwear, accessory):
        return max_three_colors(outfit_from_solution({
            'top': top, 'layer1': layer1, 'layer2': layer2,
            'bottom': bottom, 'footwear': footwear, 'accessory': accessory}))
    problem.addConstraint(constraint_max_three_colors, 
                          ['top', 'layer1', 'layer2', 'bottom', 'footwear', 'accessory'])

    def constraint_avoid_monochrome(top, layer1, layer2, bottom, footwear, accessory):
        return avoid_monochrome(outfit_from_solution({
            'top': top, 'layer1': layer1, 'layer2': layer2,
            'bottom': bottom, 'footwear': footwear, 'accessory': accessory}))
    problem.addConstraint(constraint_avoid_monochrome, 
                          ['top', 'layer1', 'layer2', 'bottom', 'footwear', 'accessory'])

    def constraint_formality(top, layer1, layer2, bottom, footwear, accessory):
        return check_formality(outfit_from_solution({
            'top': top, 'layer1': layer1, 'layer2': layer2,
            'bottom': bottom, 'footwear': footwear, 'accessory': accessory}))
    problem.addConstraint(constraint_formality, 
                          ['top', 'layer1', 'layer2', 'bottom', 'footwear', 'accessory'])

    def constraint_layers(top, layer1, layer2, bottom, footwear, accessory):
        return check_layers(outfit_from_solution({
            'top': top, 'layer1': layer1, 'layer2': layer2,
            'bottom': bottom, 'footwear': footwear, 'accessory': accessory}))
    problem.addConstraint(constraint_layers, 
                          ['top', 'layer1', 'layer2', 'bottom', 'footwear', 'accessory'])

    def constraint_no_socks(top, layer1, layer2, bottom, footwear, accessory):
        return no_socks_with_sandals_or_heels(outfit_from_solution({
            'top': top, 'layer1': layer1, 'layer2': layer2,
            'bottom': bottom, 'footwear': footwear, 'accessory': accessory}))
    problem.addConstraint(constraint_no_socks, 
                          ['top', 'layer1', 'layer2', 'bottom', 'footwear', 'accessory'])

    def constraint_heels_require_skirt(top, layer1, layer2, bottom, footwear, accessory):
        return heels_require_skirt(outfit_from_solution({
            'top': top, 'layer1': layer1, 'layer2': layer2,
            'bottom': bottom, 'footwear': footwear, 'accessory': accessory}))
    problem.addConstraint(constraint_heels_require_skirt, 
                          ['top', 'layer1', 'layer2', 'bottom', 'footwear', 'accessory'])

    def constraint_avoid_complementary(top, layer1, layer2, bottom, footwear, accessory):
        return avoid_complementary_colors(outfit_from_solution({
            'top': top, 'layer1': layer1, 'layer2': layer2,
            'bottom': bottom, 'footwear': footwear, 'accessory': accessory}))
    problem.addConstraint(constraint_avoid_complementary, 
                          ['top', 'layer1', 'layer2', 'bottom', 'footwear', 'accessory'])

    def constraint_best_match_color(top, layer1, layer2, bottom, footwear, accessory):
        return best_match_color(outfit_from_solution({
            'top': top, 'layer1': layer1, 'layer2': layer2,
            'bottom': bottom, 'footwear': footwear, 'accessory': accessory}))
    problem.addConstraint(constraint_best_match_color, 
                          ['top', 'layer1', 'layer2', 'bottom', 'footwear', 'accessory'])

    # First try: get perfect solutions.
    solutions = problem.getSolutions()
    if solutions:
        sol = solutions[0]
        outfit = outfit_from_solution(sol)
        print("Outfit found using CPS!")
        return outfit
    else:
        # No perfect solution found; iterate over all possible combinations to find the "closest match".
        def calculate_penalty(sol):
            outfit = outfit_from_solution(sol)
            penalty = 0
            # Strong penalty for duplicate items.
            if not all_unique(sol['top'], sol['layer1'], sol['layer2'], sol['bottom'], sol['footwear'], sol['accessory']):
                penalty += 10
            if not max_three_colors(outfit): penalty += 1
            if not avoid_monochrome(outfit): penalty += 1
            if not check_formality(outfit): penalty += 1
            if not check_layers(outfit): penalty += 1
            if not no_socks_with_sandals_or_heels(outfit): penalty += 1
            if not heels_require_skirt(outfit): penalty += 1
            if not avoid_complementary_colors(outfit): penalty += 1
            if not best_match_color(outfit): penalty += 1
            return penalty

        best_penalty = None
        best_sol = None
        for combo in product(tops_candidates, layer1_candidates, layer2_candidates, bottoms_candidates, footwear_candidates, accessory_candidates):
            sol_dict = {
                'top': combo[0],
                'layer1': combo[1],
                'layer2': combo[2],
                'bottom': combo[3],
                'footwear': combo[4],
                'accessory': combo[5]
            }
            pen = calculate_penalty(sol_dict)
            if best_penalty is None or pen < best_penalty:
                best_penalty = pen
                best_sol = sol_dict
                if pen == 0:
                    break  # Perfect match found.
        if best_sol is not None:
            outfit = outfit_from_solution(best_sol)
            print(f"Closest outfit found with penalty {best_penalty}")
            return outfit
        else:
            print("No outfit found even for closest match.")
            return None

# -------------------------
# Example Usage
# -------------------------
season = ['Spring']       # Adjust to a season that matches your wardrobe items.
formality = 'Casual'      # Ensure this matches items in your wardrobe.
try:
    outfit = generate_outfit_cps(season, formality, wardrobeItems)
    if outfit:
        print("Generated Outfit:")
        for item in outfit:
            print(f"Type: {item['type']}, Color: {item['color']}, Formality: {item['formality']}, Season: {item['season']}")
    else:
        print("No valid outfit found.")
except ValueError as e:
    print("Error:", e)
