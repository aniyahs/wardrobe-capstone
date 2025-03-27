// src/components/OutfitSelector.tsx
import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import StyledText from "../components/StyledText";
import GradientButton from "../components/GradientButton";
import Weather from "../components/Weather";

interface WardrobeItem {
  type: string;
  color: string;
}

interface Outfit {
  top?: WardrobeItem;
  layer1?: WardrobeItem;
  layer2?: WardrobeItem;
  bottom?: WardrobeItem;
  footwear?: WardrobeItem;
  accessory?: WardrobeItem;
}

function getContrastColor(hexColor: string): string {
  const cleaned = hexColor.replace('#', '');
  const numericColor = parseInt(cleaned, 16);
  return numericColor <= 0x505050 ? '#FFFFFF' : '#000000';
}

const renderSquare = (item?: WardrobeItem) => {
  if (!item || !item.type || !item.type.trim()) return null;
  const contrastColor = getContrastColor(item.color);
  return (
    <View style={[styles.square, { backgroundColor: item.color }]}> 
      <Text style={[styles.squareText, { color: contrastColor }]}>{item.type}</Text>
    </View>
  );
};

const renderRow = (items: (WardrobeItem | undefined)[]) => {
  const validItems = items.filter(item => item && item.type && item.type.trim());
  if (validItems.length === 0) return null;
  return (
    <View style={styles.row}>
      {validItems.map((item, index) => (
        <View key={index}>{renderSquare(item)}</View>
      ))}
    </View>
  );
};

const OutfitGeneratorScreen = () => {
  const [season, setSeason] = useState('Summer');
  const [formality, setFormality] = useState('Casual');
  const [outfit, setOutfit] = useState<Outfit | null>(null);
  const [loading, setLoading] = useState(false);
  const [weather, setWeather] = useState<{ temperature: number; weathercode: number } | null>(null);

  const generateOutfit = () => {
    setLoading(true);
    axios.post('http://10.0.2.2:5001/outfit/generate-outfit', {
      season,
      formality,
      temperature: weather?.temperature,
      weathercode: weather?.weathercode,
      user_id: 'mock-user-id' // Replace with real user ID
    })
    .then(response => {
      setOutfit(response.data);
      setLoading(false);
    })
    .catch(error => {
      console.error('Error generating outfit:', error);
      setLoading(false);
    });
  };

  return (
    <View style={styles.mainContainer}>
      <StyledText size={24} variant="title">Outfit Generator</StyledText>
      {/*}
      <Weather onWeatherFetched={(w) => setWeather(w)} />
      We got rate limited from too many requests
      */}
      <View style={{ alignItems: "center", marginBottom: 0 }}>
        {/* Drop shadow layer */}
        <View style={styles.dropShadow} />

        {/* Picker with label */}
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

      <View style={{ alignItems: "center", marginBottom: 0 }}>
        {/* Drop shadow layer */}
        <View style={styles.dropShadow} />

        {/* Picker with label */}
        <View style={styles.pickerContainer}>
        <StyledText size={18} variant="subtitle" style={styles.pickerLabel}>Formality:</StyledText>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={season}
              style={styles.picker}
              onValueChange={setSeason}
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


      <View style={{ width: "100%", alignItems: "center", justifyContent: "center" }}>
        <GradientButton title="Generate Outfit" onPress={generateOutfit} size="medium" style={{ alignSelf: "center" }}/>
      </View>

      {loading && <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />}

      {outfit && (
        <View style={styles.outfitContainer}>
          {renderRow([outfit.top, outfit.layer1, outfit.layer2])}
          {renderRow([outfit.bottom])}
          {renderRow([outfit.footwear])}
          {renderRow([outfit.accessory])}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flexGrow: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-start",
    marginHorizontal: "10%",
  },
  dropShadow: {
    position: "absolute",
    bottom: 6,
    width: "80%", // match pickerContainer width
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
  pickerDropdown: {
    backgroundColor: "#3F342E",
    borderRadius: 10,
    overflow: "hidden",
  },
  loader: { marginVertical: 16 },
  outfitContainer: { marginTop: 32 },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  square: {
    width: 100,
    height: 100,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  squareText: { fontWeight: 'bold' },
});

export default OutfitGeneratorScreen;
