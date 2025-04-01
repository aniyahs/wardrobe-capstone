import React, { useEffect, useState } from "react";
import {
  View,
  Image,
  FlatList,
  Text,
  ActivityIndicator,
  Dimensions,
  Modal,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { globalStyles } from "../styles/styles";
import { useClothing } from "../components/ClothingContext";
import type { ClothingItem } from "../components/ClothingContext";

const screenWidth = Dimensions.get("window").width;
const imageSize = screenWidth / 3 - 10;

const styleOptionsMap: Record<string, string[]> = {
  Tops: ["T-Shirt", "Long Sleeve Shirt", "Blouse", "Tank Top", "Polo", "Button-Up Shirt"],
  Bottoms: ["Jeans", "Chinos", "Shorts", "Trousers", "Joggers", "Leggings", "Skirt"],
  Outerwear: ["Jacket", "Blazer", "Coat", "Vest", "Windbreaker", "Raincoat", "Hoodie", "Sweatshirt", "Sweater"],
  Footwear: ["Sneakers", "Boots", "Dress Shoes", "Loafers", "Sandals", "Heels"],
  Accessories: ["Hat", "Belt", "Scarf", "Gloves", "Sunglasses", "Watch", "Tie"]
};

const allFilterOptions = {
  "Color": ["Black", "White", "Gray", "Navy", "Red", "Green", "Beige", "Yellow"],
  "Texture": ["Cotton", "Denim", "Wool", "Linen", "Fleece", "Leather", "Suede"],
  "Formality": ["Casual", "Business Casual", "Formal"],
  "Size": ["XS", "S", "M", "L", "XL"],
  "Season": ["Summer", "Fall", "Winter", "Spring"]
};

const Gallery = () => {
  const { clothingItems, loading, error, fetchClothingItems } = useClothing();
  const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null);
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  useEffect(() => {
    fetchClothingItems();
  }, []);

  let filteredItems = clothingItems?.filter((item) => {
    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(item.type);
    const itemTags = [
      item.style,
      item.color,
      item.texture,
      item.formality,
      item.size,
      ...(item.season || [])
    ];
    const matchesTags = selectedTags.length === 0 || itemTags.some(tag => selectedTags.includes(tag));
    return matchesType && matchesTags;
  });

  if (sortOrder === "newest") {
    filteredItems = filteredItems?.slice().reverse();
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
          }}
        >
          <Text style={{ color: selectedList.includes(tag) ? "#fff" : "#000", flexWrap: "wrap" }}>{tag}</Text>
        </Pressable>
      ))}
    </View>
  );

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
