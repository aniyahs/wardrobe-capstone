import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { getCurrentUserId } from "../api/authService";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import StyledText from "../components/StyledText";
import GradientButton from "../components/GradientButton";

interface HomeProps {
  setScreen: (screen: string) => void;
}

interface ClothingItem {
  imageUrl: string;
}

interface OutfitItem {
  _id: string;
  formality: string;
  season: string[];
  items: ClothingItem[];
  wearLog?: string[];
}

const Home: React.FC<HomeProps> = ({ setScreen }) => {
  const [outfits, setOutfits] = useState<OutfitItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOutfits = async () => {
      try {
        const userId = await getCurrentUserId();
        const response = await fetch(`http://10.0.2.2:5001/outfit/saved?userId=${userId}`);
        const data = await response.json();
        setOutfits(data);
      } catch (err) {
        console.error("Error loading saved outfits:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOutfits();
  }, []);

  const renderOutfit = ({ item }: { item: OutfitItem }) => {
    const wearLog = item.wearLog ?? [];
    const wearCount = item.wearLog?.length || 0;
    const lastWorn = wearCount > 0
      ? new Date(wearLog[wearCount - 1]).toLocaleDateString()
      : "Never";

    return (
      <View style={styles.outfitCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.title}>Formality: {item.formality}</Text>
          <TouchableOpacity onPress={() => handleDeleteOutfit(item._id)}>
            <Icon name="trash-can-outline" size={24} color="#a00" />
          </TouchableOpacity>
        </View>
        <Text>Season: {item.season.join(", ")}</Text>
        <View style={styles.imageRow}>
          {item.items.map((clothing, idx) => (
            <Image
              key={idx}
              source={{ uri: clothing.imageUrl }}
              style={styles.clothingImage}
            />
          ))}
        </View>
        <Text style={styles.wearInfo}>Worn: {wearCount} time{wearCount !== 1 ? "s" : ""}</Text>
        <Text style={styles.wearInfo}>Last worn: {lastWorn}</Text>
        <TouchableOpacity
          onPress={() => handleMarkAsWorn(item._id)}
          style={styles.markWornButton}
        >
          <Text style={styles.markWornText}>Mark as Worn</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const handleDeleteOutfit = async (outfitId: string) => {
    try {
      const response = await fetch(`http://10.0.2.2:5001/outfit/delete/${outfitId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setOutfits(prev => prev.filter(o => o._id !== outfitId));
      } else {
        const data = await response.text();
        console.error("Failed to delete:", data);
      }
    } catch (err) {
      console.error("Error deleting outfit:", err);
    }
  };

  const handleMarkAsWorn = async (outfitId: string) => {
    try {
      const response = await fetch(`http://10.0.2.2:5001/outfit/mark-worn/${outfitId}`, {
        method: "PATCH",
      });

      let data;
      const contentType = response.headers.get("Content-Type");

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(`Expected JSON, got: ${text.substring(0, 100)}`);
      }

      if (response.ok) {
        console.log("Outfit marked as worn");
        setOutfits((prev) =>
          prev.map((outfit) =>
            outfit._id === outfitId
              ? { ...outfit, wearLog: [...(outfit.wearLog || []), new Date().toISOString()] }
              : outfit
          )
        );
      } else {
        console.error("Failed to mark as worn:", data.error);
      }
    } catch (err) {
      console.error("Network error marking as worn:", err);
    }
  };

  return (
    <ScrollView 
    contentContainerStyle={styles.container}
    showsVerticalScrollIndicator={false}
    showsHorizontalScrollIndicator={false}>
      <StyledText size={32} variant="title">Saved Outfits</StyledText>

      <GradientButton
        title="Build Your Own Outfit"
        onPress={() => setScreen("CustomOutfitBuilder")}
        size="medium"
        style={{ marginBottom: 20 }}
      />
      {loading ? (
        <Text style={styles.subText}>Loading...</Text>
      ) : outfits.length === 0 ? (
        <Text style={styles.subText}>You haven't saved any outfits yet. Start generating some!</Text>
      ) : (
        <FlatList
          data={outfits}
          keyExtractor={(item) => item._id}
          renderItem={renderOutfit}
          contentContainerStyle={styles.flatListContainer}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        />
      )}
    </ScrollView>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    paddingTop: 40,
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 12,
    flexGrow: 1,
  },
  subText: {
    color: "#CCC",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  flatListContainer: {
    width: "100%",
    paddingBottom: 40,
  },
  outfitCard: {
    backgroundColor: "#999",
    padding: 12,
    marginBottom: 16,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  imageRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 6,
  },
  clothingImage: {
    width: 70,
    height: 70,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: "#ccc",
  },
  wearInfo: {
    fontSize: 14,
    color: "#222",
    marginTop: 6,
  },
  markWornButton: {
    backgroundColor: "#3F342E",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginTop: 8,
  },
  markWornText: {
    color: "#fff",
    fontWeight: "bold",
  },
  buildButton: {
    backgroundColor: "#3F342E",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 16,
    alignSelf: "center",
  },
  buildButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2D2D2D",
    marginBottom: 4,
  },
});