    import {
        StyleSheet,
        View,
        Button,
        Image,
        ActivityIndicator,
        Platform,
        SafeAreaView,
        Text,
        Alert,
    } from "react-native";

    export const savePhotoUrl = async (item: any): Promise<void> => {
      try {
        console.log('📡 Sending request to /add-item with:', item);
    
        const response = await fetch("http://10.0.2.2:5001/wardrobe/add-item", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        });
    
        const text = await response.text();
        console.log("🔍 Raw response text:", text);
    
        const data = JSON.parse(text);
    
        if (!response.ok) {
          console.error("❌ Failed to save item:", data.message);
          Alert.alert("MongoDB Save Failed", data.message || "Unknown error");
        } else {
          console.log("✅ Item saved to MongoDB:", data);
        }
      } catch (err) {
        console.error("❌ Network error saving wardrobe item:", err);
        Alert.alert("Network Error", "Failed to reach backend.");
      }
    };
    
type State = {
  imagePath: string | null;
  isLoading: boolean;
  status: string;
};