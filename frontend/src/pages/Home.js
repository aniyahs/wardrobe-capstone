import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image, StyleSheet } from "react-native";
import { getCurrentUserId } from "../api/authService";

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
      <Text style={styles.title}>Formality: {item.formality}</Text>
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

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Saved Outfits</Text>
      {loading ? (
        <Text>Loading...</Text>
      ) : outfits.length === 0 ? (
        <Text>No saved outfits yet. Go generate one!</Text>
      ) : (
        <FlatList
          data={outfits}
          keyExtractor={(item) => item._id}
          renderItem={renderOutfit}
        />
      )}
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 12 },
  outfitCard: { marginBottom: 16, padding: 12, backgroundColor: "#eee", borderRadius: 8 },
  imageRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 8 },
  clothingImage: { width: 60, height: 60, marginRight: 6, marginBottom: 6 },
  title: { fontWeight: "bold" }
});
