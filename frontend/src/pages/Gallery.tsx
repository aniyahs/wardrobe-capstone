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
  StyleSheet,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useClothing, deleteClothingItem, toggleFavoriteItem } from "../api/wardrobeService";
import type { ClothingItem } from "../api/wardrobeService";
import StyledText from "../components/StyledText";

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
  Accessories: ["Hat", "Belt", "Scarf", "Gloves", "Sunglasses", "Watch", "Tie"],
};

const allFilterOptions = {
  Texture: ["Cotton", "Denim", "Wool", "Linen", "Fleece", "Leather", "Suede"],
  Formality: ["Casual", "Business Casual", "Formal"],
  Size: ["XS", "S", "M", "L", "XL"],
  Season: ["Summer", "Fall", "Winter", "Spring"],
};

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

  // Color classification
  if (hue >= 20 && hue < 50 && lightness >= 0.7 && delta <= 0.3) return 998;  // Beige-ish
  if (hue >= 20 && hue < 50 && lightness >= 0.2 && lightness <= 0.55 && saturation >= 0.3) return 8; // Brown
  if ((hue >= 0 && hue < 20) || hue >= 340) return 1; // Red
  if (hue >= 20 && hue < 40) return 2; // Orange
  if (hue >= 40 && hue < 70) return 3; // Yellow
  if (hue >= 70 && hue < 170) return 4; // Green
  if (hue >= 170 && hue < 260) return 5; // Blue
  if (hue >= 260 && hue < 300) return 6; // Purple
  if (hue >= 300 && hue < 340) return 7; // Pink

  return 998;
}

const Gallery = () => {
  const { clothingItems, loading, error, fetchClothingItems, setClothingItems } = useClothing();
  const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null);

  // state for filter modal
  const [filterVisible, setFilterVisible] = useState(false);

  // Filter states
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedColorCategories, setSelectedColorCategories] = useState<number[]>([]);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "color">("color");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  useEffect(() => {
    fetchClothingItems();
  }, []);

  // Filter items
  let filteredItems = clothingItems?.filter((item) => {
    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(item.type);
    const itemTags = [item.style, item.texture, item.formality, item.size, ...(item.season || [])];
    const matchesTags = selectedTags.length === 0 || itemTags.some(tag => selectedTags.includes(tag));
    const matchesColor =
      selectedColorCategories.length === 0 ||
      (item.color && selectedColorCategories.includes(hueCategory(item.color)));
    const matchesFavorites = !showFavoritesOnly || item.favorite === true;
    return matchesType && matchesTags && matchesColor && matchesFavorites;
  });

  // Sort items
  if (filteredItems) {
    filteredItems = [...filteredItems];
    if (sortOrder === "newest") {
      filteredItems.reverse();
    } else if (sortOrder === "color") {
      filteredItems.sort((a, b) => {
        const categoryA = a.color ? hueCategory(a.color) : 999;
        const categoryB = b.color ? hueCategory(b.color) : 999;
        return categoryA - categoryB;
      });
    }
  }

  const toggleSelection = (
    value: string,
    selected: string[],
    setSelected: (val: string[]) => void
  ) => {
    if (selected.includes(value)) {
      setSelected(selected.filter((v) => v !== value));
    } else {
      setSelected([...selected, value]);
    }
  };

  const renderTagButtons = (
    tags: string[],
    selectedList: string[],
    setSelectedList: (val: string[]) => void
  ) => (
    <View style={styles.tagContainer}>
      {tags.map(tag => {
        const isSelected = selectedList.includes(tag);
        return (
          <Pressable
            key={tag}
            onPress={() => toggleSelection(tag, selectedList, setSelectedList)}
            style={[
              styles.tagButton,
              isSelected ? styles.tagButtonSelected : styles.tagButtonUnselected
            ]}
          >
            <Text style={isSelected ? styles.tagTextSelected : styles.tagTextUnselected}>
              {tag}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );

  // Color category filter
  const renderColorCategoryButtons = () => {
    const selectedLabels = selectedColorCategories.map(c => colorCategoryLabels[c]);

    const toggleColor = (label: string) => {
      const entry = Object.entries(colorCategoryLabels).find(([_, lbl]) => lbl === label);
      if (!entry) return;
      const [numStr] = entry;
      const num = parseInt(numStr);
      if (selectedColorCategories.includes(num)) {
        setSelectedColorCategories(selectedColorCategories.filter(c => c !== num));
      } else {
        setSelectedColorCategories([...selectedColorCategories, num]);
      }
    };

    return (
      <View style={styles.tagContainer}>
        {Object.entries(colorCategoryLabels).map(([numStr, label]) => {
          const isSelected = selectedLabels.includes(label);
          return (
            <Pressable
              key={label}
              onPress={() => toggleColor(label)}
              style={[
                styles.tagButton,
                isSelected ? styles.tagButtonSelected : styles.tagButtonUnselected
              ]}
            >
              <Text style={isSelected ? styles.tagTextSelected : styles.tagTextUnselected}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    );
  };

  // Build the filter panel inside a bottom modal
  const renderFilterModal = () => (
    <Modal
      visible={filterVisible}
      animationType="slide"
      transparent
      onRequestClose={() => setFilterVisible(false)}
    >
      {/* Dismiss overlay */}
      <Pressable style={styles.filterOverlay} onPress={() => setFilterVisible(false)} />

      <View style={styles.bottomSheet}>
        <ScrollView style={styles.filterScroll} nestedScrollEnabled>
          <Text style={styles.filterTitle}>Sort By</Text>
          <Picker
            selectedValue={sortOrder}
            onValueChange={(val) => setSortOrder(val)}
            style={{ backgroundColor: "#fff" }}
          >
            <Picker.Item label="Newest First" value="newest" />
            <Picker.Item label="Oldest First" value="oldest" />
            <Picker.Item label="Sort by Color" value="color" />
          </Picker>

          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Type</Text>
            {renderTagButtons(Object.keys(styleOptionsMap), selectedTypes, setSelectedTypes)}
          </View>

          {/* Style field depends on selected type */}
          {selectedTypes.length > 0 && (
            <View style={styles.filterSection}>
              <Text style={styles.filterTitle}>Style</Text>
              {renderTagButtons(
                selectedTypes.flatMap(t => styleOptionsMap[t] || []),
                selectedTags,
                setSelectedTags
              )}
            </View>
          )}

          {/* Additional categories */}
          {Object.entries(allFilterOptions).map(([category, tags]) => (
            <View key={category} style={styles.filterSection}>
              <Text style={styles.filterTitle}>{category}</Text>
              {renderTagButtons(tags, selectedTags, setSelectedTags)}
            </View>
          ))}

          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Color</Text>
            {renderColorCategoryButtons()}
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Favorites Only</Text>
            <Pressable
              onPress={() => setShowFavoritesOnly(!showFavoritesOnly)}
              style={[
                styles.favoritesToggle,
                { backgroundColor: showFavoritesOnly ? "#444" : "#ddd" }
              ]}
            >
              <Text style={{ color: showFavoritesOnly ? "#fff" : "#000" }}>
                {showFavoritesOnly ? "Showing Favorites" : "Show Favorites"}
              </Text>
            </Pressable>
          </View>

          <TouchableOpacity
            style={styles.closeFilterButton}
            onPress={() => setFilterVisible(false)}
          >
            <Text style={styles.closeFilterButtonText}>Done</Text>
          </TouchableOpacity>
          <View style={{ height: 32 }} /> 
        </ScrollView>
      </View>
    </Modal>
  );

  // Render each clothing item in the grid
  // Only the single clothing item that you toggle will refresh rather than the entire page 
  const renderItem = ({ item }: { item: ClothingItem }) => (
    <View style={styles.imageSizeContainer}>
      <TouchableOpacity onPress={() => setSelectedItem(item)}>
        <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={async () => {
          try {
            setClothingItems((prevItems: ClothingItem[]) => {
              const updatedItems = prevItems.map((currentItem: ClothingItem) => {
                if (currentItem._id === item._id){
                  return { ...currentItem, favorite: !item.favorite }
                }
                return currentItem;
              });
              return updatedItems;
            });
            await toggleFavoriteItem(item._id, item.favorite);
          } catch (err) {
            console.error("Failed to toggle favorite:", err);

            // If there is an error, it goes back to the previous status 
            setClothingItems((prevItems: ClothingItem[]) => {
              const revertedItems = prevItems.map((currentItem: ClothingItem) => {
                if (currentItem._id === item._id) {
                  return { ...currentItem, favorite: item.favorite };
                }
                return currentItem;
              });
              return revertedItems;
            });
          }
        }}
        style={styles.favoriteButton}
      >
        <MaterialCommunityIcons
          name={item.favorite ? "heart" : "heart-outline"}
          size={20}
          color={item.favorite ? "#ff4444" : "#444"}
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={{ paddingTop: 40, paddingBottom: 10, alignItems: "center" }}>
        <StyledText size={32} variant="title">Gallery View</StyledText>
      </View>

      {/* Main content: List of items */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item._id}
        numColumns={3}
        renderItem={renderItem}
        extraData={clothingItems}
        contentContainerStyle={styles.flatListContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
      />
      
      {/* Floating filter button */}
      <TouchableOpacity
        style={styles.floatingFilterButton}
        onPress={() => setFilterVisible(true)}
      >
        <MaterialCommunityIcons name="filter" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Fullscreen item detail modal */}
      <Modal
        visible={selectedItem != null}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setSelectedItem(null)}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>
            {selectedItem && (
              <>
                <Image source={{ uri: selectedItem.imageUrl }} style={styles.modalImage} />

                <View style={styles.modalInfoCard}>
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
                      <Text key={key} style={styles.modalLine}>
                        <Text style={styles.modalKey}>{key}:</Text>{" "}
                        <Text style={styles.modalValue}>{value}</Text>
                      </Text>
                    ));
                  })()}
                </View>

                <TouchableOpacity
                  onPress={async () => {
                    try {
                      await deleteClothingItem(selectedItem._id);
                      setSelectedItem(null);
                      fetchClothingItems();
                    } catch (err) {
                      console.error("Error deleting item:", err);
                    }
                  }}
                  style={styles.deleteButton}
                >
                  <Text style={styles.deleteButtonText}>Delete Item</Text>
                </TouchableOpacity>

                <Text onPress={() => setSelectedItem(null)} style={styles.closeText}>
                  Close
                </Text>
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Bottom filter modal (slide-up) */}
      {renderFilterModal()}
    </View>
  );
};

export default Gallery;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flatListContent: {
    paddingBottom: 35,
    paddingHorizontal: 5,
  },
  imageSizeContainer: {
    width: imageSize,
    height: imageSize,
    padding: 2,
  },
  itemImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    borderRadius: 5,
    backgroundColor: "#eee",
  },
  favoriteButton: {
    position: "absolute",
    right: 6,
    top: 6,
    backgroundColor: "rgba(255,255,255,0.8)",
    padding: 4,
    borderRadius: 20,
  },

  // Floating filter button (circular)
  floatingFilterButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    backgroundColor: "#3F342E", // coffee-brown background
    padding: 16,
    borderRadius: 50,
    elevation: 5,
  },

  // Filter modal overlay
  filterOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
  },

  // Bottom sheet container
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#2D2D2D",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "70%",
    elevation: 10,
  },
  filterScroll: {
    padding: 16,
    paddingBottom: 80,
  },
  filterTitle: {
    fontWeight: "bold",
    marginBottom: 4,
    color: "#DDD",
    fontSize: 16,
  },
  filterSection: {
    marginTop: 12,
  },
  favoritesToggle: {
    padding: 8,
    borderRadius: 8,
    marginTop: 6,
    width: 120,
    alignItems: "center",
  },
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  tagButton: {
    backgroundColor: "#3F342E",
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
    maxWidth: "30%",
  },
  tagButtonSelected: {
    backgroundColor: "#6C6A67",
  },
  tagButtonUnselected: {
    backgroundColor: "#3F342E",
  },
  tagTextSelected: {
    color: "#DDD",
    fontWeight: "bold",
    textAlign: "center",
  },
  tagTextUnselected: {
    color: "#DDD",
    fontWeight: "bold",
    textAlign: "center",
  },
  closeFilterButton: {
    marginTop: 20,
    padding: 12,
    backgroundColor: "#6C6A67",
    borderRadius: 8,
    alignItems: "center",
  },
  closeFilterButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  // Item detail modal
  modalSafeArea: {
    flex: 1,
    backgroundColor: "black",
  },
  modalScroll: {
    flex: 1,
    width: "100%",
    
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalImage: {
    width: "90%",
    height: 320,
    resizeMode: "cover",
    borderRadius: 12,
    marginBottom: 24,
    backgroundColor: "#ccc",
  },
  modalInfoCard: {
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
  },
  modalLine: {
    fontSize: 16,
    marginBottom: 6,
  },
  modalKey: {
    fontWeight: "600",
    color: "#333",
  },
  modalValue: {
    color: "#444",
  },
  deleteButton: {
    marginTop: 20,
    backgroundColor: "#ff5555",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  closeText: {
    color: "#DDD",
    fontSize: 16,
    marginTop: 30,
    textDecorationLine: "underline",
  },
});
