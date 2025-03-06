import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';

// 1) Define the interface for outfit items
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

// 2) Helper: if the color is darker than #505050, use white text
function getContrastColor(hexColor: string): string {
  const cleaned = hexColor.replace('#', '');
  const numericColor = parseInt(cleaned, 16);
  return numericColor <= 0x505050 ? '#FFFFFF' : '#000000';
}

// 3) Render a single square if the item is valid (has a non-empty type).
const renderSquare = (item?: WardrobeItem) => {
  if (!item || !item.type || !item.type.trim()) {
    return null;
  }

  const contrastColor = getContrastColor(item.color);
  return (
    <View style={[styles.square, { backgroundColor: item.color }]}>
      <Text style={[styles.squareText, { color: contrastColor }]}>
        {item.type}
      </Text>
    </View>
  );
};

// 4) Render a row of squares from an array of items
//    This allows multiple items in a single row (like top, layer1, layer2).
const renderRow = (items: (WardrobeItem | undefined)[]) => {
  const validItems = items.filter(
    (item) => item && item.type && item.type.trim()
  );

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

  // 5) Fetch the outfit from the backend
  const generateOutfit = () => {
    setLoading(true);
    axios
      .post('http://10.0.2.2:5001/outfit/generate-outfit', { season, formality })
      .then((response) => {
        setOutfit(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error generating outfit:', error);
        setLoading(false);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Outfit Generator</Text>

      {/* Season Picker */}
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Season:</Text>
        <Picker
          selectedValue={season}
          style={styles.picker}
          onValueChange={(value) => setSeason(value)}
        >
          <Picker.Item label="Summer" value="Summer" />
          <Picker.Item label="Spring" value="Spring" />
          <Picker.Item label="Fall" value="Fall" />
          <Picker.Item label="Winter" value="Winter" />
        </Picker>
      </View>

      {/* Formality Picker */}
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Formality:</Text>
        <Picker
          selectedValue={formality}
          style={styles.picker}
          onValueChange={(value) => setFormality(value)}
        >
          <Picker.Item label="Casual" value="Casual" />
          <Picker.Item label="Business Casual" value="Business Casual" />
          <Picker.Item label="Formal" value="Formal" />
          <Picker.Item label="Smart Casual" value="Smart Casual" />
        </Picker>
      </View>

      {/* Generate Button */}
      <Button title="Generate Outfit" onPress={generateOutfit} />

      {/* Loader */}
      {loading && <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />}

      {/* Outfit Display */}
      {outfit && (
        <View style={styles.outfitContainer}>
          {/* Row 1: Top, Layer1, Layer2 */}
          {renderRow([outfit.top, outfit.layer1, outfit.layer2])}

          {/* Row 2: Bottom */}
          {renderRow([outfit.bottom])}

          {/* Row 3: Footwear */}
          {renderRow([outfit.footwear])}

          {/* Row 4: Accessory */}
          {renderRow([outfit.accessory])}
        </View>
      )}
    </View>
  );
};

// 6) Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    //backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  pickerContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 4,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  loader: {
    marginVertical: 16,
  },
  outfitContainer: {
    marginTop: 32,
  },
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
  squareText: {
    fontWeight: 'bold',
  },
});

export default OutfitGeneratorScreen;
