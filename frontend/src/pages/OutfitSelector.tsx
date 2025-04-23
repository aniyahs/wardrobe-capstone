import React, { useState } from 'react';
import { View, Text, ActivityIndicator, Image, StyleSheet, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import StyledText from "../components/StyledText";
import GradientButton from "../components/GradientButton";
import Weather from "../components/Weather";
import { getCurrentUserId } from "../api/authService";
import { useClothing } from "../api/wardrobeService";

interface WardrobeItem {
  _id?: string;
  imageUrl: string;
  type: string;
  color: string;
  style?: string;
  favorite?: boolean;
  formality: string;
  season: string[];
  photoUrl?: string;
  size?: string;
  texture?: string;
  userId?: string;
}

const OutfitGeneratorScreen = () => {
  // Changed outfit state to be an array of WardrobeItem
  const [season, setSeason] = useState('Summer');
  const [formality, setFormality] = useState('Casual');
  const [outfit, setOutfit] = useState<WardrobeItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [weather, setWeather] = useState<{ temperature: number; weathercode: number } | null>(null);
  const { clothingItems, fetchClothingItems } = useClothing();

  const generateOutfit = async () => {
    setLoading(true);
    try {
      const userId = await getCurrentUserId();
      if (!userId) throw new Error("User not logged in");

      if (!clothingItems || clothingItems.length === 0) {
        await fetchClothingItems(); // Fetch again if not loaded
      }

      const payload = {
        season,
        formality,
        clothingItems,
        temperature: weather?.temperature,
        weathercode: weather?.weathercode,
        userId,
      };

      axios
        .post('http://10.0.2.2:5001/outfit/generate-outfit', payload)
        .then(response => {
          // The backend returns an array of wardrobe items
          setOutfit(response.data);
        })
        .catch(error => {
          console.error("❌ Axios error:", error.response?.data || error.message);
          console.log("🕵️‍♂️ Payload that caused error:", JSON.stringify(payload, null, 2));
        })
        .finally(() => setLoading(false));
    } catch (error) {
      console.error("Error fetching clothing items:", error);
      setLoading(false);
    }
  };

  // New helper function to render an outfit item with additional properties.
  const renderOutfitItem = (item: WardrobeItem) => {
    if (!item || !item.imageUrl) return null;

    return (
      <View style={styles.outfitItem}>
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.itemInfo}>
          <Text style={styles.itemText}>Type: {item.type}</Text>
          {item.style && <Text style={styles.itemText}>Style: {item.style}</Text>}
          <Text style={styles.itemText}>Color: {item.color}</Text>
          <Text style={styles.itemText}>Formality: {item.formality}</Text>
          <Text style={styles.itemText}>Season: {item.season.join(', ')}</Text>
          {item.size && <Text style={styles.itemText}>Size: {item.size}</Text>}
          {item.texture && <Text style={styles.itemText}>Texture: {item.texture}</Text>}
        </View>
      </View>
    );
  };

  const handleSaveOutfit = async () => {
    try {
      const userId = await getCurrentUserId();
      if (!userId || !outfit) {
        console.log("Please log in or generate an outfit first.");
        return;
      }
      const payload = {
        userId,
        items: outfit,
        season: [season],
        formality,
      };
  
      const response = await fetch("http://10.0.2.2:5001/outfit/save-outfit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
  
      if (response.ok) {
        console.log("✅ Outfit saved successfully!");
      } else {
        console.error("❌ Failed to save outfit:", data.error);
        console.error("Failed to save outfit.");
      }
    } catch (err) {
      console.error("🚨 Unexpected error:", err);
      console.error("An error occurred while saving.");
    }
  };
  

  return (
    <ScrollView contentContainerStyle={styles.mainContainer}>
      <View style={{ paddingTop: 20, marginBottom: 10 }}>
        <StyledText size={32} variant="title">Outfit Generator</StyledText>
      </View>
      
      {/*<Weather onWeatherFetched={(w) => setWeather(w)} />*/}

      <View style={{ alignItems: "center", marginBottom: 10 }}>
        <View style={styles.dropShadow} />
        <View style={styles.pickerContainer}>
          <StyledText size={18} variant="subtitle" style={styles.pickerLabel}>Season:</StyledText>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={season}
              style={styles.picker}
              onValueChange={setSeason}
              dropdownIconColor="#DDD"
              mode="dropdown"
              itemStyle={styles.pickerItem}
            >
              <Picker.Item label="Summer" value="Summer" style={styles.pickerItem}/>
              <Picker.Item label="Spring" value="Spring" style={styles.pickerItem}/>
              <Picker.Item label="Fall" value="Fall" style={styles.pickerItem}/>
              <Picker.Item label="Winter" value="Winter" style={styles.pickerItem}/>
            </Picker>
          </View>
        </View>
      </View>

      <View style={{ alignItems: "center", marginBottom: 10 }}>
        <View style={styles.dropShadow} />
        <View style={styles.pickerContainer}>
          <StyledText size={18} variant="subtitle" style={styles.pickerLabel}>Formality:</StyledText>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={formality}
              style={styles.picker}
              onValueChange={setFormality}
              dropdownIconColor="#DDD"
              mode="dropdown"
              itemStyle={styles.pickerItem}
            >
              <Picker.Item label="Casual" value="Casual" style={styles.pickerItem}/>
              <Picker.Item label="Business Casual" value="Business Casual" style={styles.pickerItem}/>
              <Picker.Item label="Formal" value="Formal" style={styles.pickerItem}/>
              <Picker.Item label="Smart Casual" value="Smart Casual" style={styles.pickerItem}/>
            </Picker>
          </View>
        </View>
      </View>

      <View style={{ width: "100%", alignItems: "center", marginVertical: 10 }}>
        <GradientButton title="Generate Outfit" onPress={generateOutfit} size="medium" style={{ alignSelf: "center" }}/>
      </View>

      {loading && <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />}

      {outfit && (
        <View style={styles.outfitContainer}>
          {outfit.map((item, index) => (
            <View key={index}>
              {renderOutfitItem(item)}
            </View>
          ))}
        </View>
      )}

      {outfit && (
        <View style={{ marginTop: 20, alignItems: "center" }}>
          <GradientButton
            title="Save Outfit"
            onPress={handleSaveOutfit}
            size="medium"
          />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flexGrow: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-start",
    marginHorizontal: "10%",
    paddingVertical: 20,
  },
  dropShadow: {
    position: "absolute",
    bottom: 6,
    width: "80%",
    height: 10,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    zIndex: -1,
  },
  pickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "80%",
    paddingHorizontal: 10,
    backgroundColor: "#3F342E",
    borderRadius: 10,
    marginBottom: 10,
    paddingVertical: 2,
  },
  pickerLabel: { flexShrink: 1, marginRight: 8 },
  pickerWrapper: { flex: 1 },
  picker: {
    height: 60,
    color: "#DDD",
    textAlign: "center",
    fontSize: 14,
    backgroundColor: "#3F342E",
    fontWeight: "bold",
  },
  pickerItem: {
    color: "#DDD",
    fontSize: 16,
    textShadowColor: "rgba(0, 0, 0, 0.7)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
    backgroundColor: "#3F342E",
  },
  loader: { marginVertical: 16 },
  outfitContainer: {
    marginTop: 32,
    width: "100%",
  },
  outfitItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    borderRadius: 10,
    padding: 10,
    backgroundColor: "#3F342E",
  },
  image: {
    width: 100,
    height: 100,
    backgroundColor: "#3F342E",
  },
  itemInfo: {
    marginLeft: 10,
    flexShrink: 1,
    backgroundColor: "#3F342E",
    
  },
  itemText: {
    fontWeight: 'bold',
    marginBottom: 2,
    color: "#DDD",
  },
});

export default OutfitGeneratorScreen;
