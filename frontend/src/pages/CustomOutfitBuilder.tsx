import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, FlatList, StyleSheet, ScrollView } from "react-native";
import { useClothing } from "../api/wardrobeService";
import { getCurrentUserId } from "../api/authService";
import GradientButton from "../components/GradientButton";
import { StackNavigationProp } from '@react-navigation/stack';

interface WardrobeItem {
  _id: string;
  imageUrl: string;
  type: string;
  color?: string;
  style?: string;
  formality?: string;
  season?: string[];
  size?: string;
  texture?: string;
}

type OutfitSlots = {
    [category: string]: WardrobeItem | null;
  };

interface Props {
    setScreen: (screen: string) => void;
  }  

const CustomOutfitBuilder: React.FC<Props> = ({ setScreen }) => {
  const { clothingItems } = useClothing();
  const [selectedItems, setSelectedItems] = useState<OutfitSlots>({});
  const [formality, setFormality] = useState("Casual");
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>([]);

  const clothingTypes = [...new Set(clothingItems.map(item => item.type))];

  const toggleSelect = (item: WardrobeItem) => {
    const type = item.type;
    if (selectedItems[type]?._id === item._id) {
      const updated = { ...selectedItems };
      delete updated[type];
      setSelectedItems(updated);
    } else {
      setSelectedItems((prev) => ({ ...prev, [type]: item }));
    }
  };

  const isValidOutfit = () =>
    selectedItems["Top"] && selectedItems["Bottom"] && selectedItems["Footwear"];

  const handleSave = async () => {
    try {
      const userId = await getCurrentUserId();
      const outfitItems = Object.values(selectedItems);
      const payload = {
        userId,
        items: outfitItems,
        season: selectedSeasons,
        formality: formality,
      };
      const response = await fetch("http://10.0.2.2:5001/outfit/save-outfit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        console.log("Custom outfit saved");
        setScreen("Home");
      } else {
        const data = await response.json();
        console.error("Failed to save outfit:", data.error);
      }
    } catch (err) {
      console.error("Error saving custom outfit:", err);
    }
  };

  const renderItem = ({ item }: { item: WardrobeItem }) => {
    const isSelected = selectedItems[item.type]?._id === item._id;
    return (
      <TouchableOpacity
        onPress={() => toggleSelect(item)}
        style={[styles.itemCard, isSelected && styles.selectedCard]}
      >
        <Image source={{ uri: item.imageUrl }} style={styles.image} />
        <Text style={styles.itemText}>{item.style || item.type}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Build Your Own Outfit</Text>
      <View style={styles.pickerSection}>
        <Text style={styles.section}>Select Formality</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {["Casual", "Business Casual", "Formal", "Smart Casual"].map((option) => (
            <TouchableOpacity
                key={option}
                onPress={() => setFormality(option)}
                style={[
                styles.formalityButton,
                formality === option && styles.formalitySelected
                ]}
            >
                <Text style={styles.formalityText}>{option}</Text>
            </TouchableOpacity>
            ))}
        </ScrollView>
        </View>

        <View style={styles.pickerSection}>
  <Text style={styles.section}>Select Seasons</Text>
  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
    {["Summer", "Spring", "Fall", "Winter"].map((season) => {
            const isSelected = selectedSeasons.includes(season);
            return (
                <TouchableOpacity
                key={season}
                onPress={() =>
                    setSelectedSeasons((prev) =>
                    isSelected
                        ? prev.filter((s) => s !== season)
                        : [...prev, season]
                    )
                }
                style={[
                    styles.seasonButton,
                    isSelected && styles.seasonSelected
                ]}
                >
                <Text style={styles.seasonText}>{season}</Text>
                </TouchableOpacity>
            );
            })}
        </ScrollView>
        </View>

        {clothingTypes.map((type) => (
            <View key={type}>
            <Text style={styles.section}>{type}</Text>
            <View style={{ width: "100%" }}>
            <FlatList
                data={clothingItems.filter((item) => item.type === type)}
                keyExtractor={(item) => item._id}
                horizontal
                renderItem={renderItem}
                contentContainerStyle={{ paddingBottom: 8, flexGrow: 0 }}
                showsHorizontalScrollIndicator={false}
            />
            </View>
            </View>
        ))}
        <View style={styles.previewPane}>
            <Text style={styles.previewTitle}>Outfit Preview</Text>
            <View style={styles.previewGrid}>
                {Object.entries(selectedItems).map(([type, item]) => (
                <View key={type} style={styles.previewItem}>
                    {item ? (
                    <Image source={{ uri: item.imageUrl }} style={styles.previewImage} />
                    ) : (
                    <View style={[styles.previewImage, styles.missingImage]} />
                    )}
                    <Text style={styles.previewLabel}>{type}</Text>
                </View>
                ))}
            </View>
            </View>



      <View style={{ marginVertical: 24 }}>
        <GradientButton
          title="Save Outfit"
          onPress={handleSave}
          disabled={!isValidOutfit()}
          size="medium"
          style={styles.saveButton}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  section: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  itemCard: {
    marginRight: 12,
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#ddd",
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: "#3F342E",
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#ccc",
  },
  itemText: {
    marginTop: 6,
    fontSize: 14,
  },
  flatList: {
    paddingBottom: 8,
  },
  previewPane: {
    marginTop: 20,
    marginBottom: 10,
    alignItems: "center",
    padding: 10,
    backgroundColor: "#eee",
    borderRadius: 10,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  previewGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 16,
  },
  previewRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
  },
  previewItem: {
    alignItems: "center",
    marginHorizontal: 80,
  },
  previewImage: {
    width: 60,
    height: 60,
    borderRadius: 6,
    backgroundColor: "#ccc",
  },
  missingImage: {
    backgroundColor: "#999",
    borderWidth: 1,
    borderColor: "#fff",
  },
  previewLabel: {
    marginTop: 4,
    color: "#444",
    fontSize: 12,
    textAlign: "center",
  },  
  horizontalList: {
    paddingBottom: 8,
    minHeight: 100,
  },  
  saveButton: {
    alignSelf: "center",
    marginTop: 10,
  },  
  pickerSection: {
    marginBottom: 20,
  },
  
  formalityButton: {
    backgroundColor: "#ccc",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  
  formalitySelected: {
    backgroundColor: "#3F342E",
  },
  
  formalityText: {
    color: "#000",
    fontWeight: "bold",
  },
  seasonButton: {
    backgroundColor: "#ccc",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  
  seasonSelected: {
    backgroundColor: "#3F342E",
  },
  
  seasonText: {
    color: "#000",
    fontWeight: "bold",
  },
});

export default CustomOutfitBuilder;