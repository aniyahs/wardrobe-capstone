import React, { useState } from "react";
import { View, Image, Alert, ActivityIndicator, StyleSheet, Text } from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import { globalStyles } from "../styles/styles";
import { uploadImageToStorage } from "../components/Firebase";
import { savePhotoUrl } from "../api/uploadService";
import { getCurrentUserId } from "../api/authService";
import GradientButton from "../components/GradientButton";
import { Picker } from "@react-native-picker/picker";
import DropShadow from "../components/DropShadow";

const PhotoUpload = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [pickerValues, setPickerValues] = useState<string[]>(Array(9).fill(""));
  const styleOptionsMap: Record<string, string[]> = {
    Tops: ["T-Shirt", "Long Sleeve Shirt", "Blouse", "Tank Top", "Polo", "Button-Up Shirt"],
    Bottoms: ["Jeans", "Chinos", "Shorts", "Trousers", "Joggers", "Leggings", "Skirt"],
    Outerwear: ["Jacket", "Blazer", "Coat", "Vest", "Windbreaker", "Raincoat", "Hoodie", "Sweatshirt", "Sweater"],
    Footwear: ["Sneakers", "Boots", "Dress Shoes", "Loafers", "Sandals", "Heels"],
    Accessories: ["Hat", "Belt", "Scarf", "Gloves", "Sunglasses", "Watch", "Tie"],
  };

  const [selectedType, setSelectedType] = useState<string>("Tops");
  const [selectedSeason, setSelectedSeason] = useState<string[]>([]);

  const toggleSeason = (season: string) => {
    setSelectedSeason(prev =>
      prev.includes(season) ? prev.filter(s => s !== season) : [...prev, season]
    );
  };

  const updatePickerValue = (index: number, value: string) => {
    setPickerValues(prev => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const handleSelectPhoto = () => {
    launchImageLibrary(
      {
        mediaType: "photo",
        quality: 0.5,
        includeBase64: false,
      },
      (response) => {
        if (response.didCancel) {
          console.log("User cancelled image picker");
        } else if (response.errorCode) {
          Alert.alert("Error", "Image picker error: " + response.errorMessage);
        } else if (response.assets && response.assets[0]?.uri) {
          const imageUri = response.assets[0].uri;
          setSelectedImage(imageUri);
        } else {
          Alert.alert("Error", "No image selected");
        }
      }
    );
  };

  const handleUpload = async () => {
    if (!selectedImage) return;

    setIsUploading(true);

    try {
      const downloadUrl = await uploadImageToStorage(selectedImage);
      const userId = await getCurrentUserId();

      if (!userId) throw new Error("User not logged in");

      console.log("📡 Saving photo to Flask backend...", { userId, downloadUrl });
      await savePhotoUrl(userId, downloadUrl);

      Alert.alert("Success", "Image uploaded and saved to MongoDB!");
      setSelectedImage(null);
      setPickerValues(Array(9).fill(""));
    } catch (err) {
      console.error("❌ Upload failed:", err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View style={globalStyles.container}>
      {!selectedImage && !isUploading && (
        <GradientButton
          title="Upload a Photo"
          subtitle="Select from Camera Roll"
          onPress={handleSelectPhoto}
        />
      )}

      {isUploading && (
        <ActivityIndicator size="large" color="#5EB0E5" style={{ marginTop: 24 }} />
      )}

      {selectedImage && !isUploading && (
        <>
          <Image source={{ uri: selectedImage }} style={globalStyles.imagePreview} />
          

          <View style={styles.multiSelectContainer}>
            <View style={styles.seasonOptions}>
            {["Summer", "Fall", "Winter", "Spring"].map(season => (
              <View key={season} style={styles.seasonShadowWrapper}>
                <View style={styles.dropShadowSmall} />
                <Text
                  style={[
                    styles.seasonOption,
                    selectedSeason.includes(season) && styles.seasonSelected,
                  ]}
                  onPress={() => toggleSeason(season)}
                >
                  {season}
                </Text>
              </View>
            ))}
            </View>
          </View>

          <View style={{ alignItems: "center" }}>
            <View style={styles.dropShadow}/>         
              <View style={styles.centeredPickerContainer}>
                  <Text style={styles.pickerLabel}>Favorite:</Text>
                  <View style={styles.pickerWrapper}>
                    <Picker
                      selectedValue={pickerValues[8]}
                      style={styles.picker}
                      onValueChange={(value) => updatePickerValue(8, value)}
                      dropdownIconColor="#DDD"
                      mode="dropdown"
                    >
                      {["Yes", "No"].map(opt => (
                        <Picker.Item label={opt} value={opt} key={opt} style={styles.pickerItem}/>
                      ))}
                    </Picker>
                  </View>
              </View>
            </View>

          <View style={styles.dropdownGrid}>
            {/* Left column */}
            <View style={styles.dropdownColumn}>
              {[
                {
                  label: "Type",
                  options: Object.keys(styleOptionsMap),
                  onChange: (value: string) => {
                    setSelectedType(value);
                    updatePickerValue(0, value);
                  },
                  selected: selectedType,
                },
                {
                  label: "Style",
                  options: styleOptionsMap[selectedType],
                  onChange: (value: string) => updatePickerValue(1, value),
                  selected: pickerValues[1],
                },
                {
                  label: "Size",
                  options: ["XS", "S", "M", "L", "XL"],
                  onChange: (value: string) => updatePickerValue(6, value),
                  selected: pickerValues[6],
                },
              ].map((dropdown, index) => (
                <View key={index} style={{ alignItems: "center" }}>
                  {/* Drop shadow below the picker row */}
                  <View style={styles.dropShadow} />

                  {/* Picker row */}
                  <View style={styles.centeredPickerContainer}>
                    <View style={{flexDirection: "column"}}>
                      <Text style={styles.pickerLabel}>{dropdown.label}:</Text>
                      <View style={styles.pickerWrapper}>
                    </View>
                    <View style={{flexDirection: "row"}}>
                      <Picker
                        selectedValue={dropdown.selected}
                        style={styles.picker}
                        onValueChange={dropdown.onChange}
                        dropdownIconColor="#DDD"
                        mode="dropdown"
                      >
                        {dropdown.options.map(opt => (
                          <Picker.Item label={opt} value={opt} key={opt} style={styles.pickerItem}/>
                        ))}
                      </Picker>
                    </View>
                  </View>
                  </View>
                </View>
              ))}
            </View>

            {/* Right column */}
            <View style={styles.dropdownColumn}>
              {[
                {
                  label: "Color",
                  options: ["Black", "White", "Gray", "Navy", "Red", "Green", "Beige", "Yellow"],
                  onChange: (value: string) => updatePickerValue(2, value),
                  selected: pickerValues[2],
                },
                {
                  label: "Texture",
                  options: ["Cotton", "Denim", "Wool", "Linen", "Fleece", "Leather", "Suede"],
                  onChange: (value: string) => updatePickerValue(3, value),
                  selected: pickerValues[3],
                },
                {
                  label: "Formality",
                  options: ["Casual", "Business Casual", "Formal"],
                  onChange: (value: string) => updatePickerValue(5, value),
                  selected: pickerValues[5],
                },
              ].map((dropdown, index) => (
                <View key={index} style={{ alignItems: "center" }}>
                  {/* Drop shadow below the picker row */}
                  <View style={styles.dropShadow} />

                  {/* Picker row */}
                  <View style={styles.centeredPickerContainer}>
                    <View style={{flexDirection: "column"}}>
                      <Text style={styles.pickerLabel}>{dropdown.label}:</Text>
                      <View style={styles.pickerWrapper}>
                    </View>
                    <View style={{flexDirection: "row"}}>
                      <Picker
                        selectedValue={dropdown.selected}
                        style={styles.picker}
                        onValueChange={dropdown.onChange}
                        dropdownIconColor="#DDD"
                        mode="dropdown"
                      >
                        {dropdown.options.map(opt => (
                          <Picker.Item label={opt} value={opt} key={opt} style={styles.pickerItem}/>
                        ))}
                      </Picker>
                    </View>
                  </View>
                  
                  </View>
                </View>
              ))}
            </View>
          </View>
          <View style={{ marginTop: 20 }}>
            <GradientButton title="Upload" onPress={handleUpload} size="medium" />
          </View>
          
          
        </>
      )}
    </View>
  );
};

export default PhotoUpload;

const styles = StyleSheet.create({
  seasonShadowWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    marginBottom: 0,
  },
  dropShadowSmall: {
    position: "absolute",
    bottom: -3,
    width: '100%', // Let it auto-match the button width
    height: 6,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    zIndex: -1,
  },
  
  dropdownGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "95%",
  },
  
  dropdownColumn: {
    flex: 1,
    alignItems: "center",
  },
  pickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "90%",
    paddingHorizontal: 10,
    backgroundColor: "#3F342E",
    borderRadius: 10,
    paddingVertical: 4,
  },
  pickerLabel: {
    flexShrink: 1,
    marginRight: 8,
    color: "#DDD",
    fontWeight: "bold",
  },
  pickerWrapper: {
    flex: 1,
    width: "100%",
  },
  picker: {
    height: 50,
    color: "#DDD",
    fontSize: 14,
    backgroundColor: "#3F342E",
    fontWeight: "bold",
    width: "100%",
  },
  pickerItem: {
    color: "#DDD",
    fontSize: 16,
    textShadowColor: "rgba(0, 0, 0, 0.7)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
    backgroundColor: "#3F342E",
  },
  multiSelectContainer: {
    width: "90%",
    alignSelf: "center",
    marginTop: 10,
  },
  seasonOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 5,
  },
  seasonOption: {
    marginTop: 10,
    color: "#DDD",
    backgroundColor: "#3F342E",
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 10,
    fontWeight: "bold",
  },  
  seasonSelected: {
    backgroundColor: "#6C6A67",
    color: "#DDD",
    borderColor: "#3F342E",
    fontWeight: "bold",
  },
  centeredPickerContainer: {
    width: "90%",
    alignSelf: "center",
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3F342E",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pickerContainerVertical: {
    width: "90%",
    marginBottom: 10,
  },
  pickerLabelAbove: {
    color: "#DDD",
    fontWeight: "bold",
    marginBottom: 4,
    fontSize: 14,
  },
  dropShadow: {
    position: "absolute",
    bottom: -4,
    width: "90%",
    height: 8,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    zIndex: -1,
  }
});