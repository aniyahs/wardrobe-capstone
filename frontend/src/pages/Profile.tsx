import React, { useState, useEffect } from "react";
import { getCurrentUserId } from "../api/authService";
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, ScrollView, Image } from "react-native";

// Calculate cost-per-wear
const calculateCPW = (item: { wears: number; cost: number }) => (item.wears > 0 ? (item.cost / item.wears).toFixed(2) : "N/A");

// State for alert settings
const Profile = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  
  const toggleSection = (key: string) => {
    setExpandedSections((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const userId = await getCurrentUserId();
        const response = await fetch(`http://10.0.2.2:5001/outfit/analytics?userId=${userId}`);
        const contentType = response.headers.get("Content-Type");

        if (!response.ok) {
          const text = await response.text();
          throw new Error(`Backend error: ${response.status} — ${text}`);
        }
  
        if (!contentType || !contentType.includes("application/json")) {
          const text = await response.text();
          throw new Error(`Expected JSON, got: ${text.substring(0, 100)}`);
        }
        
        const data = await response.json();
        setAnalytics(data);
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);
  
  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading analytics...</Text>
      </View>
    );
  }  

  return (
    
<ScrollView style={styles.pageWrapper} contentContainerStyle={styles.container}>
  <Text style={styles.title}>Clothing Analytics</Text>

    {/* Most Worn Items */}
    <TouchableOpacity onPress={() => toggleSection("mostWorn")}>
      <Text style={styles.sectionTitle}>
        {expandedSections.includes("mostWorn") ? "▼ " : "▶ "} Most Worn (by Type)
      </Text>
    </TouchableOpacity>
    {expandedSections.includes("mostWorn") && (
      analytics && Object.entries(analytics.mostWornByType).map(([type, items]: [string, any]) => (
        <View key={type} style={{ marginBottom: 10 }}>
          <Text style={styles.subtitle}>{type}</Text>
          <ScrollView style={styles.itemScroll} nestedScrollEnabled>
            {items.map((item: any) => (
              <View key={item._id} style={styles.itemRow}>
                <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
                <View style={styles.itemInfo}>
                  <Text style={styles.listItem}>{item.style || item.type}</Text>
                  <Text style={styles.listItem}>{item.wearCount} wear{item.wearCount !== 1 ? "s" : ""}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      ))
    )}

    {/* Most worn colors */}
    <TouchableOpacity onPress={() => toggleSection("colors")}>
      <Text style={styles.sectionTitle}>
        {expandedSections.includes("colors") ? "▼ " : "▶ "} Most Used Colors (by Type)
      </Text>
    </TouchableOpacity>
    {expandedSections.includes("colors") && (
      analytics && Object.entries(analytics.mostUsedColors).map(([type, colorMap]: [string, any]) => (
        <View key={type}>
          <Text style={styles.subtitle}>{type}</Text>
          {Object.entries(colorMap as Record<string, number>).map(([color, count]) => (
            <Text key={color} style={styles.listItem}>
              {color}: {count} times
            </Text>
          ))}
        </View>
      ))
    )}

    {/* Season Usage */}
    <TouchableOpacity onPress={() => toggleSection("seasons")}>
      <Text style={styles.sectionTitle}>
        {expandedSections.includes("seasons") ? "▼ " : "▶ "} Items by Season
      </Text>
    </TouchableOpacity>
    {expandedSections.includes("seasons") && (
      analytics && Object.entries(analytics.seasonUsage as Record<string, number>).map(([season, count]) => (
        <Text key={season} style={styles.listItem}>
          {season}: {count} outfit(s)
        </Text>
      ))
    )}

      {/* Unused items */}
      <TouchableOpacity onPress={() => toggleSection("unworn")}>
      <Text style={styles.sectionTitle}>
        {expandedSections.includes("unworn") ? "▼ " : "▶ "} Items You Haven’t Worn Yet
      </Text>
    </TouchableOpacity>
    {expandedSections.includes("unworn") && (
      analytics && analytics.unwornItems.length > 0 ? (
        analytics.unwornItems.map((item: any) => (
          <Text key={item._id} style={styles.listItem}>
            {item.style || item.type}
          </Text>
        ))
      ) : (
        <Text style={styles.listItem}>All items have been used — nice job!</Text>
      )
    )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 80, 
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
  itemScroll: {
    maxHeight: 220,
    marginTop: 8,
  },
  
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 8,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 6,
    marginRight: 10,
    backgroundColor: "#ccc",
  },  
  itemInfo: {
    flexShrink: 1,
  }, 
  pageWrapper: {
    flex: 1,
  },
});

export default Profile;
