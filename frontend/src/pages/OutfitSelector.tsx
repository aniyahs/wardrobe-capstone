import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';

interface Outfit {
  top: { color: string };
  layer1?: { color: string } | null;
  layer2?: { color: string } | null;
  bottom: { color: string };
  footwear: { color: string };
  accessory?: { color: string } | null;
}

const OutfitGeneratorScreen = () => {
  const [season, setSeason] = useState('Summer');
  const [formality, setFormality] = useState('Casual');
  const [outfit, setOutfit] = useState<Outfit | null>(null);
  const [loading, setLoading] = useState(false);

  const generateOutfit = () => {
    setLoading(true);

    // Simulated "API response" with test colors
    setTimeout(() => {
      setOutfit({
        top: { color: '#FF6347' }, // Tomato
        layer1: { color: '#FFD700' }, // Gold
        layer2: null, // No second layer
        bottom: { color: '#4682B4' }, // Steel Blue
        footwear: { color: '#8B4513' }, // Saddle Brown
        accessory: { color: '#32CD32' } // Lime Green
      });

      setLoading(false);
    }, 1000); // Simulated delay
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Outfit Generator</Text>

      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Season:</Text>
        <Picker
          selectedValue={season}
          style={styles.picker}
          onValueChange={value => setSeason(value)}
        >
          <Picker.Item label="Summer" value="Summer" />
          <Picker.Item label="Spring" value="Spring" />
          <Picker.Item label="Fall" value="Fall" />
          <Picker.Item label="Winter" value="Winter" />
        </Picker>
      </View>

      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Formality:</Text>
        <Picker
          selectedValue={formality}
          style={styles.picker}
          onValueChange={value => setFormality(value)}
        >
          <Picker.Item label="Casual" value="Casual" />
          <Picker.Item label="Business Casual" value="Business Casual" />
          <Picker.Item label="Formal" value="Formal" />
          <Picker.Item label="Smart Casual" value="Smart Casual" />
        </Picker>
      </View>

      <Button title="Generate Outfit" onPress={generateOutfit} />

      {loading && <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />}

      {outfit && (
        <View style={styles.outfitContainer}>
          {/* First row: Top, Layer1, Layer2 */}
          <View style={styles.row}>
            <View style={[styles.square, { backgroundColor: outfit.top.color }]}>
              <Text style={styles.squareText}>Top</Text>
            </View>
            <View style={[styles.square, { backgroundColor: outfit.layer1 ? outfit.layer1.color : '#fff' }]}>
              <Text style={styles.squareText}>Layer1</Text>
            </View>
            <View style={[styles.square, { backgroundColor: outfit.layer2 ? outfit.layer2.color : '#fff' }]}>
              <Text style={styles.squareText}>Layer2</Text>
            </View>
          </View>
          {/* Second row: Bottom */}
          <View style={styles.row}>
            <View style={[styles.square, { backgroundColor: outfit.bottom.color }]}>
              <Text style={styles.squareText}>Bottom</Text>
            </View>
          </View>
          {/* Third row: Footwear */}
          <View style={styles.row}>
            <View style={[styles.square, { backgroundColor: outfit.footwear.color }]}>
              <Text style={styles.squareText}>Footwear</Text>
            </View>
          </View>
          {/* Fourth row: Accessory */}
          <View style={styles.row}>
            <View style={[styles.square, { backgroundColor: outfit.accessory ? outfit.accessory.color : '#fff' }]}>
              <Text style={styles.squareText}>Accessory</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff'
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24
  },
  pickerContainer: {
    marginBottom: 16
  },
  label: {
    fontSize: 16,
    marginBottom: 4
  },
  picker: {
    height: 50,
    width: '100%'
  },
  loader: {
    marginVertical: 16
  },
  outfitContainer: {
    marginTop: 32
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16
  },
  square: {
    width: 100,
    height: 100,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center'
  },
  squareText: {
    color: '#000',
    fontWeight: 'bold'
  }
});

export default OutfitGeneratorScreen;
