import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { getCurrentUserId } from "../api/authService";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import StyledText from "../components/StyledText";

const Home = () => {
  const [outfits, setOutfits] = useState([]);
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

  const renderOutfit = ({ item }) => (
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
    </View>
  );

  const handleDeleteOutfit = async (outfitId) => {
    try {
      const response = await fetch(`http://10.0.2.2:5001/outfit/delete/${outfitId}`, {
        method: "DELETE",
      });
  
      if (response.ok) {
        setOutfits(prev => prev.filter(o => o._id !== outfitId));
      } else {
        const data = await response.text();
        console.error("❌ Failed to delete:", data.error);
      }
    } catch (err) {
      console.error("Error deleting outfit:", err);
    }
  };  

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StyledText size={32} variant="title">Saved Outfits</StyledText>
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
        alignItems: "center",
        paddingVertical: 24,
        paddingHorizontal: 12,
        backgroundColor: "#2D2D2D",
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
});
