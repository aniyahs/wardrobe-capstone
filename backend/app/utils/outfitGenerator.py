from sampleWardrobe import clothingTypes, wardrobeItems
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
    # Returns True if any required season is in the item's season list.
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

def all_unique(*args):
    non_none = [x for x in args if x is not None]
    return len(non_none) == len(set(id(x) for x in non_none))


# -------------------------
# Updated Generator with Season and Formality Penalties
# -------------------------

def generate_outfit_cps(season, formality, wardrobeItems):
    """
    Generate an outfit from wardrobeItems.
    Instead of filtering by season or formality, all items of the correct type are allowed.
    A penalty of 10 is added for each item that does not match the required season and for each item that does not match the required formality.
    """
    # Build candidate lists based solely on type.
    tops_candidates = [item for item in wardrobeItems if item['type'] in clothingTypes['tops']]
    bottoms_candidates = [item for item in wardrobeItems if item['type'] in clothingTypes['bottoms']]
    footwear_candidates = [item for item in wardrobeItems if item['type'] in clothingTypes['footwear']]
    accessories_candidates = [item for item in wardrobeItems if item['type'] in clothingTypes['accessories']]
    layering_candidates = [item for item in wardrobeItems if item['type'] in clothingTypes['tops'] or item['type'] in clothingTypes['outerwear']]

    # Optional items can be None.
    layer1_candidates = [None] + layering_candidates
    layer2_candidates = [None] + layering_candidates
    accessory_candidates = [None] + accessories_candidates

    # Check mandatory domains.
    if not tops_candidates:
        raise ValueError("No valid tops available.")
    if not bottoms_candidates:
        raise ValueError("No valid bottoms available.")
    if not footwear_candidates:
        raise ValueError("No valid footwear available.")

    # Variables and candidate sets.
    variables = ['top', 'layer1', 'layer2', 'bottom', 'footwear', 'accessory']
    candidates = {
        'top': tops_candidates,
        'layer1': layer1_candidates,
        'layer2': layer2_candidates,
        'bottom': bottoms_candidates,
        'footwear': footwear_candidates,
        'accessory': accessory_candidates
    }

    # Helper: Build a complete outfit from an assignment.
    def outfit_from_assignment(assignment):
        outfit = []
        outfit.append(assignment['top'])
        if assignment['layer1'] is not None:
            outfit.append(assignment['layer1'])
        if assignment['layer2'] is not None:
            outfit.append(assignment['layer2'])
        outfit.append(assignment['bottom'])
        outfit.append(assignment['footwear'])
        if assignment['accessory'] is not None:
            outfit.append(assignment['accessory'])
        return outfit

    # Final penalty function.
    def calculate_penalty(assignment):
        outfit = outfit_from_assignment(assignment)
        penalty = 0

        # Uniqueness: No repeated items.
        if not all_unique(
            assignment['top'], assignment['layer1'], assignment['layer2'],
            assignment['bottom'], assignment['footwear'], assignment['accessory']
        ):
            penalty += 10

        # Other constraint penalties.
        if not max_three_colors(outfit):
            penalty += 1
        if not avoid_monochrome(outfit):
            penalty += 1
        if not check_layers(outfit):
            penalty += 1
        if not no_socks_with_sandals_or_heels(outfit):
            penalty += 1
        if not heels_require_skirt(outfit):
            penalty += 1
        if not avoid_complementary_colors(outfit):
            penalty += 1
        if not best_match_color(outfit):
            penalty += 1

        # Season and formality penalties.
        for item in outfit:
            if not get_seasons_match(item, season):
                penalty += 10
            if item['formality'] != formality:
                penalty += 10

        return penalty

    # Partial penalty for early pruning.
    def partial_penalty(assignment):
        penalty = 0
        assigned = [assignment.get(var) for var in variables if var in assignment]
        non_none = [x for x in assigned if x is not None]

        if len(non_none) != len(set(id(x) for x in non_none)):
            penalty += 10

        # For each assigned item, add penalties if season or formality mismatches.
        for item in non_none:
            if not get_seasons_match(item, season):
                penalty += 10
            if item['formality'] != formality:
                penalty += 10

        colors = {x['color'] for x in non_none}
        if len(colors) > 3:
            penalty += 1

        types = {x['type'] for x in non_none}
        if 'Socks' in types and (('Sandals' in types) or ('Heels' in types)):
            penalty += 1

        bottom_item = assignment.get('bottom')
        if bottom_item is not None:
            if any(x is not None and x['type'] == 'Heels' for x in non_none):
                if bottom_item['type'] != 'Skirt':
                    penalty += 1

        return penalty

    best_solution = None
    best_penalty = float('inf')

    def backtrack(index, current_assignment):
        nonlocal best_solution, best_penalty
        if index == len(variables):
            pen = calculate_penalty(current_assignment)
            if pen < best_penalty:
                best_penalty = pen
                best_solution = current_assignment.copy()
            return

        var = variables[index]
        for candidate_item in candidates[var]:
            current_assignment[var] = candidate_item
            part_pen = partial_penalty(current_assignment)
            if part_pen > best_penalty:
                del current_assignment[var]
                continue

            backtrack(index + 1, current_assignment)
            del current_assignment[var]

    backtrack(0, {})

    if best_solution is not None:
        final_outfit = outfit_from_assignment(best_solution)
        print(f"Closest outfit found with penalty {best_penalty}")
        for item in final_outfit:
            print(f"Type: {item['type']}, Color: {item['color']}, Formality: {item['formality']}, Season: {item['season']}")
        return final_outfit
    else:
        print("No outfit found even for closest match.")
        return None

# -------------------------
# Example Usage (commented out)
# -------------------------
# season = ['Spring']
# formality = 'Casual'
# try:
#     outfit = generate_outfit_cps(season, formality, wardrobeItems)
#     if outfit:
#         print("Generated Outfit:")
#         for item in outfit:
#             print(f"Type: {item['type']}, Color: {item['color']}, Formality: {item['formality']}, Season: {item['season']}")
#     else:
#         print("No valid outfit found.")
# except ValueError as e:
#     print("Error:", e)
