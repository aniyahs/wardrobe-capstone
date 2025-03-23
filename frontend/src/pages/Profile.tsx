import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet } from "react-native";
// Need to adjust stylesheet
//import { globalStyles } from "../styles/styles";

// Fake clothing data (normally would come from a database)
const clothingData = [
  { id: "1", name: "Blue Jeans", wears: 25, cost: 40 },
  { id: "2", name: "White T-Shirt", wears: 50, cost: 15 },
  { id: "3", name: "Red Hoodie", wears: 10, cost: 60 },
  { id: "4", name: "Sneakers", wears: 80, cost: 100 },
  { id: "5", name: "Leather Jacket", wears: 5, cost: 120 },
  { id: "6", name: "Black Pants", wears: 15, cost: 35 },
];

// Sort items based on wear count
const mostWorn = [...clothingData].sort((a, b) => b.wears - a.wears)[0];
const leastWorn = [...clothingData].sort((a, b) => a.wears - b.wears)[0];

// Fake frequently paired pieces (just an example)
const frequentlyPaired = ["White T-Shirt & Blue Jeans", "Sneakers & Black Pants"];

// Calculate cost-per-wear
const calculateCPW = (item: { wears: number; cost: number }) => (item.wears > 0 ? (item.cost / item.wears).toFixed(2) : "N/A");

// State for alert settings
const Profile = () => {
  const [alerts, setAlerts] = useState<{ [key: string]: string }>({});

  const setAlertForItem = (id: string, days: string) => {
    setAlerts((prev) => ({ ...prev, [id]: days }));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Clothing Analytics</Text>

      {/* Most & Least Worn Items */}
      <Text style={styles.subtitle}>Most Worn: {mostWorn.name} ({mostWorn.wears} wears)</Text>
      <Text style={styles.subtitle}>Least Worn: {leastWorn.name} ({leastWorn.wears} wears)</Text>

      {/* Frequently Paired Pieces */}
      <Text style={styles.sectionTitle}>Frequently Paired Pieces</Text>
      {frequentlyPaired.map((pair, index) => (
        <Text key={index} style={styles.listItem}>{pair}</Text>
      ))}

      {/* Cost-Per-Wear */}
      <Text style={styles.sectionTitle}>Cost-Per-Wear</Text>
      <FlatList
        data={clothingData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Text style={styles.listItem}>
            {item.name}: ${calculateCPW(item)} per wear
          </Text>
        )}
      />

      {/* Alert Settings */}
      <Text style={styles.sectionTitle}>Set Alerts for Underused Items</Text>
      {clothingData.map((item) => (
        <View key={item.id} style={styles.alertContainer}>
          <Text>{item.name}</Text>
          <TextInput
            style={styles.input}
            placeholder="Days"
            keyboardType="numeric"
            onChangeText={(text) => setAlertForItem(item.id, text)}
            value={alerts[item.id] || ""}
          />
          <TouchableOpacity
            style={styles.alertButton}
            // onPress={() => alert(`Alert set for ${item.name} if not worn in ${alerts[item.id] || "0"} days`)}
          >
            <Text style={styles.alertButtonText}>Set Alert</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
    marginBottom: 60,
    marginTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
  },
  listItem: {
    fontSize: 16,
    paddingVertical: 5,
  },
  alertContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 5,
    width: 50,
    marginHorizontal: 10,
    textAlign: "center",
    borderRadius: 5,
  },
  alertButton: {
    backgroundColor: "#007bff",
    padding: 8,
    borderRadius: 5,
  },
  alertButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default Profile;
