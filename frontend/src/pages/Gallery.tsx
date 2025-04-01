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
} from "react-native";
import { globalStyles } from "../styles/styles";
import { useClothing } from "../components/ClothingContext";
import type { ClothingItem } from "../components/ClothingContext";

const screenWidth = Dimensions.get("window").width;
const imageSize = screenWidth / 3 - 10;

const Gallery = () => {
  console.log("📸 Rendering Gallery component...");

  const { clothingItems, loading, error, fetchClothingItems } = useClothing();
  const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null);

  useEffect(() => {
    fetchClothingItems();
  }, []);

  if (loading) {
    return (
      <View style={globalStyles.centered}>
        <ActivityIndicator size="large" color="#000" />
        <Text>Loading your wardrobe...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={globalStyles.centered}>
        <Text style={{ color: "red" }}>Error fetching clothing items.</Text>
      </View>
    );
  }

  if (!clothingItems || clothingItems.length === 0) {
    return (
      <View style={globalStyles.centered}>
        <Text>No clothing items found. Add some to your wardrobe!</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
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
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4
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

      <FlatList
        data={clothingItems}
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
                }}
              />
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ alignItems: "flex-start", paddingVertical: 10 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default Gallery;
