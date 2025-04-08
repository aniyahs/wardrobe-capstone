import React, { useEffect, useState } from "react";
import {
  View,
  Image,
  FlatList,
  Text,
  Dimensions,
  Modal,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { globalStyles } from "../styles/styles";
import { useClothing, deleteClothingItem } from "../api/wardrobeService"
import type { ClothingItem } from "../api/wardrobeService";

const screenWidth = Dimensions.get("window").width;
const imageSize = screenWidth / 3 - 10;

const colorCategoryLabels: Record<number, string> = {
  1: "Red",
  2: "Orange",
  3: "Yellow",
  4: "Green",
  5: "Blue",
  6: "Purple",
  7: "Pink",
  8: "Brown",
  998: "Beige",
  999: "Grayscale",
};

const styleOptionsMap: Record<string, string[]> = {
  Tops: ["T-Shirt", "Long Sleeve Shirt", "Blouse", "Tank Top", "Polo", "Button-Up Shirt"],
  Bottoms: ["Jeans", "Chinos", "Shorts", "Trousers", "Joggers", "Leggings", "Skirt"],
  Outerwear: ["Jacket", "Blazer", "Coat", "Vest", "Windbreaker", "Raincoat", "Hoodie", "Sweatshirt", "Sweater"],
  Footwear: ["Sneakers", "Boots", "Dress Shoes", "Loafers", "Sandals", "Heels"],
  Accessories: ["Hat", "Belt", "Scarf", "Gloves", "Sunglasses", "Watch", "Tie"]
};

const allFilterOptions = {
  "Texture": ["Cotton", "Denim", "Wool", "Linen", "Fleece", "Leather", "Suede"],
  "Formality": ["Casual", "Business Casual", "Formal"],
  "Size": ["XS", "S", "M", "L", "XL"],
  "Season": ["Summer", "Fall", "Winter", "Spring"]
};

function hexToHue(hex: string): number {
  const bigint = parseInt(hex.replace("#", ""), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;

  let hue = 0;
  if (delta === 0) hue = 0;
  else if (max === rNorm) hue = ((gNorm - bNorm) / delta) % 6;
  else if (max === gNorm) hue = (bNorm - rNorm) / delta + 2;
  else hue = (rNorm - gNorm) / delta + 4;

  hue = Math.round(hue * 60);
  return hue < 0 ? hue + 360 : hue;
}

function isGrayscale(r: number, g: number, b: number): boolean {
  return Math.abs(r - g) < 10 && Math.abs(g - b) < 10 && Math.abs(r - b) < 10;
}

function hueCategory(hex: string): number {
  const r = parseInt(hex.substr(1, 2), 16) / 255;
  const g = parseInt(hex.substr(3, 2), 16) / 255;
  const b = parseInt(hex.substr(5, 2), 16) / 255;

  if (isGrayscale(r * 255, g * 255, b * 255)) return 999;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let hue = 0;
  if (delta !== 0) {
    if (max === r) hue = ((g - b) / delta) % 6;
    else if (max === g) hue = (b - r) / delta + 2;
    else hue = (r - g) / delta + 4;
    hue *= 60;
    if (hue < 0) hue += 360;
  }

  const lightness = (max + min) / 2;
  const saturation = delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1));

  if (hue >= 20 && hue < 50 && lightness >= 0.7 && delta <= 0.3) {
    return 998; // Beige
  }

  if (hue >= 20 && hue < 50 && lightness >= 0.2 && lightness <= 0.55 && saturation >= 0.3) {
    return 8; // Brown
  }

  if ((hue >= 0 && hue < 20) || hue >= 340) return 1;   // Red
  if (hue >= 20 && hue < 40) return 2;                  // Orange
  if (hue >= 40 && hue < 70) return 3;                  // Yellow
  if (hue >= 70 && hue < 170) return 4;                 // Green
  if (hue >= 170 && hue < 260) return 5;                // Blue
  if (hue >= 260 && hue < 300) return 6;                // Purple
  if (hue >= 300 && hue < 340) return 7;                // Pink

  return 998; // fallback to Beige/Gray
}

const Gallery = () => {
  const { clothingItems, loading, error, fetchClothingItems } = useClothing();
  const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null);
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedColorCategories, setSelectedColorCategories] = useState<number[]>([]);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "color">("color");

  useEffect(() => {
    fetchClothingItems();
  }, []);

  let filteredItems = clothingItems?.filter((item) => {
    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(item.type);
    const itemTags = [
      item.style,
      item.texture,
      item.formality,
      item.size,
      ...(item.season || [])
    ];
    const matchesTags = selectedTags.length === 0 || itemTags.some(tag => selectedTags.includes(tag));
    const matchesColor =
      selectedColorCategories.length === 0 ||
      (item.color && selectedColorCategories.includes(hueCategory(item.color)));

    return matchesType && matchesTags && matchesColor;
  });

  if (filteredItems) {
    filteredItems = filteredItems.slice();

    if (sortOrder === "newest") {
      filteredItems.reverse();
    } else if (sortOrder === "color") {
      filteredItems.sort((a, b) => {
        const categoryA = a.color ? hueCategory(a.color) : 999;
        const categoryB = b.color ? hueCategory(b.color) : 999;
        return categoryA - categoryB;
      });
    }
    // sortOrder === "oldest" -> do nothing (default)
  }

  const toggleSelection = (value: string, selected: string[], setSelected: (val: string[]) => void) => {
    if (selected.includes(value)) {
      setSelected(selected.filter((v) => v !== value));
    } else {
      setSelected([...selected, value]);
    }
  };

  const renderTagButtons = (tags: string[], selectedList: string[], setSelectedList: (val: string[]) => void) => (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      {tags.map((tag) => (
        <Pressable
          key={tag}
          onPress={() => toggleSelection(tag, selectedList, setSelectedList)}
          style={{
            padding: 8,
            backgroundColor: selectedList.includes(tag) ? "#444" : "#ddd",
            borderRadius: 8,
            marginBottom: 8,
            maxWidth: "30%"
          }}
        >
          <Text style={{ color: selectedList.includes(tag) ? "#fff" : "#000", flexWrap: "wrap" }}>{tag}</Text>
        </Pressable>
      ))}
    </View>
  );

  const renderColorCategoryButtons = () => {
    const selectedLabels = selectedColorCategories.map(c => colorCategoryLabels[c]);
    const toggleColor = (label: string) => {
      const categoryEntry = Object.entries(colorCategoryLabels).find(([_, l]) => l === label);
      if (!categoryEntry) return;
      const [numStr] = categoryEntry;
      const num = parseInt(numStr);
      if (selectedColorCategories.includes(num)) {
        setSelectedColorCategories(selectedColorCategories.filter(c => c !== num));
      } else {
        setSelectedColorCategories([...selectedColorCategories, num]);
      }
    };

    return (
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {Object.entries(colorCategoryLabels).map(([numStr, label]) => {
          const selected = selectedLabels.includes(label);
          return (
            <Pressable
              key={label}
              onPress={() => toggleColor(label)}
              style={{
                padding: 8,
                backgroundColor: selected ? "#444" : "#ddd",
                borderRadius: 8,
                marginBottom: 8,
                maxWidth: "30%"
              }}
            >
              <Text style={{ color: selected ? "#fff" : "#000" }}>{label}</Text>
            </Pressable>
          );
        })}
      </View>
    );
  };

  const renderFilterSection = () => {
    const availableStyles = selectedTypes.length
      ? selectedTypes.flatMap(type => styleOptionsMap[type] || [])
      : [];

    return (
      <ScrollView
        style={{ padding: 10, backgroundColor: "#f5f5f5", maxHeight: 400 }}
        nestedScrollEnabled={true}
        showsVerticalScrollIndicator={true}
      >
        <Text style={{ fontWeight: "bold" }}>Sort By</Text>
        <Picker
          selectedValue={sortOrder}
          onValueChange={(val) => setSortOrder(val)}
          style={{ backgroundColor: "#fff" }}
        >
          <Picker.Item label="Newest First" value="newest" />
          <Picker.Item label="Oldest First" value="oldest" />
          <Picker.Item label="Sort by Color" value="color" />
        </Picker>

        <View style={{ marginTop: 12 }}>
          <Text style={{ fontWeight: "bold" }}>Type</Text>
          {renderTagButtons(Object.keys(styleOptionsMap), selectedTypes, setSelectedTypes)}
        </View>

        {availableStyles.length > 0 && (
          <View style={{ marginTop: 12 }}>
            <Text style={{ fontWeight: "bold" }}>Style</Text>
            {renderTagButtons(availableStyles, selectedTags, setSelectedTags)}
          </View>
        )}

        {Object.entries(allFilterOptions).map(([category, tags]) => (
          <View key={category} style={{ marginTop: 12 }}>
            <Text style={{ fontWeight: "bold" }}>{category}</Text>
            {renderTagButtons(tags, selectedTags, setSelectedTags)}
          </View>
        ))}

        <View style={{ marginTop: 12 }}>
          <Text style={{ fontWeight: "bold" }}>Color</Text>
          {renderColorCategoryButtons()}
        </View>
      </ScrollView>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item._id}
        numColumns={3}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => setSelectedItem(item)}>
            <View style={{ width: imageSize, height: imageSize, padding: 2 }}>
              <Image
                source={{ uri: item.imageUrl }}
                style={{
                  width: "100%",
                  height: "100%",
                  resizeMode: "cover",
                  borderRadius: 5,
                  backgroundColor: "#eee",
                }}
              />
            </View>
          </TouchableOpacity>
        )}
        ListHeaderComponent={
          <View style={{ marginTop: 50, marginBottom: 10 }}>
            <Pressable
              onPress={() => setFilterVisible((prev) => !prev)}
              style={{ padding: 12, backgroundColor: "#ccc", alignItems: "center" }}
            >
              <Text style={{ fontWeight: "bold" }}>Toggle Filters</Text>
            </Pressable>
            {filterVisible && renderFilterSection()}
          </View>
        }
        contentContainerStyle={{ paddingTop: 10, paddingBottom: 20, paddingHorizontal: 5 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
      />

      <Modal
        visible={selectedItem != null}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setSelectedItem(null)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
          <ScrollView
            style={{ flex: 1, width: "100%" }}
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              alignItems: "center",
              padding: 20,
            }}
          >
            {selectedItem && (
              <>
                <Image
                  source={{ uri: selectedItem.imageUrl }}
                  style={{
                    width: "90%",
                    height: 320,
                    resizeMode: "cover",
                    borderRadius: 12,
                    marginBottom: 24,
                    backgroundColor: "#ccc",
                  }}
                />

                <View
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: 12,
                    paddingVertical: 16,
                    paddingHorizontal: 20,
                    width: "90%",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.1,
                    shadowRadius: 2,
                    elevation: 3,
                  }}
                >
                  {(() => {
                    const builtTags: Record<string, string> = {
                      type: selectedItem.type,
                      style: selectedItem.style,
                      color: selectedItem.color,
                      texture: selectedItem.texture,
                      formality: selectedItem.formality,
                      size: selectedItem.size,
                      ...(Array.isArray(selectedItem.season)
                        ? { season: selectedItem.season.join(", ") }
                        : { season: selectedItem.season || "" }),
                    };

                    return Object.entries(builtTags).map(([key, value]) => (
                      <Text key={key} style={{ fontSize: 16, marginBottom: 6 }}>
                        <Text style={{ fontWeight: "600", color: "#333" }}>{key}:</Text>{" "}
                        <Text style={{ color: "#444" }}>{value}</Text>
                      </Text>
                    ));
                  })()}
                </View>

                <Text
                  onPress={() => setSelectedItem(null)}
                  style={{
                    color: "#ccc",
                    fontSize: 16,
                    marginTop: 30,
                    textDecorationLine: "underline",
                  }}
                >
                  Close
                </Text>
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

export default Gallery;
