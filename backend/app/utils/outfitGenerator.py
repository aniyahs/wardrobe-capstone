from sampleWardrobe import clothingTypes, wardrobeItems

# Example usage
#tshirts = [item for item in wardrobeItems if item["type"] in clothingTypes["tops"]]
#print(tshirts)


def hexToHSV(clothes):
    color = clothes["color"].lstrip("#")

    # Convert HEX to RGB (0-255 range)
    r, g, b = [int(color[i:i+2], 16) for i in (0, 2, 4)]

    # Normalize RGB values (0-1 range)
    r_norm, g_norm, b_norm = r / 255.0, g / 255.0, b / 255.0

    # Get min and max RGB values
    c_max = max(r_norm, g_norm, b_norm)
    c_min = min(r_norm, g_norm, b_norm)
    delta = c_max - c_min

    # Calculate Hue (H)
    if delta == 0:
        h = 0 
    elif c_max == r_norm:
        h = ((g_norm - b_norm) / delta) % 6
    elif c_max == g_norm:
        h = ((b_norm - r_norm) / delta) + 2
    elif c_max == b_norm:
        h = ((r_norm - g_norm) / delta) + 4
        
    # Convert to degrees (0-360)
    h = round(h * 60)  
    if h < 0:
        h += 360 

    # Calculate Saturation (S)
    s = 0 if c_max == 0 else (delta / c_max) * 100

    # Calculate Value (V)
    v = c_max * 100

    return round(h, 2), round(s, 2), round(v, 2)

def isNeurtal(h,s,v):
    if v < 12 or v > 88: 
        if s < 15:
            return True   
    return False


# Example Usage
for item in wardrobeItems:
    hsv = hexToHSV(item)
    print(f"{item['color']} -> HSV: {hsv}")



""" 
Rules of thumb:
    - Never more than 3 colors in an outfit
    - Avoid complementary outfits
    - Analogous colors are your friend
    - Monochromatic = same hue different SV
    - Triadic = Also kinda cringe

 """

"""
    - Monochrome except black
    - Contrasting colors
    - Too contrasting average top and average bottom
    - If bottom/top is colorful, the other should be neutral
    - Formatlity must match across the outfit
    - Max one accessory
    - Seasonal check
    - Sandals/Heels = no socks
    - Heels = skirt
    - max = 3 layers of clothing
"""

def bestMatchColor(clothes):
    # complementary colors (H + 180) % 360
    # Analogous colors (H + 30) % 360, (H + 60) % 360
    
    return