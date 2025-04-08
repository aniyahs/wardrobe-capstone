import React, { useState } from "react";
import {
  View,
  Image,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Text,
} from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import { globalStyles } from "../styles/styles";
import { uploadImageToStorage } from "../components/Firebase";
import { savePhotoUrl } from "../api/uploadService";
import { getCurrentUserId } from "../api/authService";
import GradientButton from "../components/GradientButton";
import { Picker } from "@react-native-picker/picker";
import  ColorPicker  from "react-native-wheel-color-picker";
import { predictTags } from "@/api/predictService";


const PhotoUpload = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isPredicting, setIsPredicting] = useState<boolean>(false);
  const [pickerValues, setPickerValues] = useState<string[]>(Array(9).fill(""));
  const [selectedHexColor, setSelectedHexColor] = useState<string>("#000000");
  const [step, setStep] = useState<"color" | "tags">("color");

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

          setPickerValues([
            "Tops",
            "T-Shirt",
            "Black",
            "Cotton",
            "",
            "Casual",
            "XS",
            "",
            "Yes",
          ]);

          setSelectedHexColor("#FFFFFF");
          setSelectedSeason([]);
          setStep("color");
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

      // for predicting the tags
      setIsPredicting(true);
      const predictedTags = await predictTags(downloadUrl);
      console.log('🎯 Predicted tags:', predictedTags);
      setIsPredicting(false);

      updatePickerValue(0, predictedTags.type || "Tops");    
      updatePickerValue(2, predictedTags.color || "#000000"); 
      updatePickerValue(3, predictedTags.pattern || "Solid");

      const itemData = {
        userId,
        photoUrl: downloadUrl,
        type: pickerValues[0],
        style: pickerValues[1],
        color: pickerValues[2],
        texture: pickerValues[3],
        formality: pickerValues[5],
        size: pickerValues[6],
        favorite: pickerValues[8] === "Yes",
        season: selectedSeason.length > 0
            ? selectedSeason
            : ["Summer", "Fall", "Winter", "Spring"],
        };

      console.log("📡 Uploading item:", itemData);
      await savePhotoUrl(itemData);
      Alert.alert("Success", "Image uploaded and saved to MongoDB!");

      setSelectedImage(null);
      setPickerValues(Array(9).fill(""));
      setSelectedSeason([]);
    } catch (err) {
      console.error("❌ Upload failed:", err);
      Alert.alert("Upload Failed", "Could not upload image.");
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

          {step === "color" ? (
            <>
              <View style={{ alignItems: "center", marginTop: 30 }}>
                <Text style={{ color: "#DDD", fontSize: 16, fontWeight: "bold", marginBottom: 12 }}>
                  Pick a Color
                </Text>
                <View style={{ height: 250, width: 250 }}>
                <ColorPicker
                  color={selectedHexColor}
                  onColorChange={setSelectedHexColor}
                  thumbSize={30}
                  sliderSize={30}
                  noSnap={true}
                  row={false}
                  swatches={true}
                  swatchesLast={true}
                  discrete={false} // use smooth slider
                  autoResetSlider={false} // keep current lightness when moving on wheel
                  shadeWheelThumb={true} // show thumb color on the wheel
                  shadeSliderThumb={true} // show thumb color on the slider
                  useNativeDriver={true} // for better performance
                  palette={[
                    "#fdf6e3",
                    "#f5e8d0",
                    "#e9d5b8",
                    "#d4bda0",
                    "#c1a78c",
                    "#a98977",
                    "#92735e",
                    "#7c5c45",
                  ]}
                />
                </View>
              </View>
              
              <View style={{ marginTop: 30 }}>
                <GradientButton
                  title="Next"
                  onPress={() => {
                    updatePickerValue(2, selectedHexColor);
                    setStep("tags");
                  }}
                  size="medium"
                />
              </View>
            </>
          ) : (
            <>
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

              <View style={styles.dropdownGrid}>
                <View style={styles.dropdownColumn}>
                  {/* Type, Style, Size */}
                  {[{
                    label: "Type",
                    options: Object.keys(styleOptionsMap),
                    onChange: (value: string) => {
                      setSelectedType(value);
                      updatePickerValue(0, value);

                      if (value === "Accessories") {
                        updatePickerValue(3, ""); 
                        updatePickerValue(6, ""); 
                      }
                    },
                    selected: selectedType,
                  }, {
                    label: "Style",
                    options: styleOptionsMap[selectedType],
                    onChange: (value: string) => updatePickerValue(1, value),
                    selected: pickerValues[1],
                  }, {
                    label: "Size",
                    options: ["XS", "S", "M", "L", "XL"],
                    onChange: (value: string) => updatePickerValue(6, value),
                    selected: pickerValues[6],
                  }].map((dropdown, index) => {
                    if (dropdown.label === "Size" && selectedType === "Accessories") return null;
                  
                    return (
                    <View key={index} style={{ alignItems: "center" }}>
                      <View style={styles.dropShadow} />
                      <View style={styles.centeredPickerContainer}>
                        <View style={{ flexDirection: "column" }}>
                          <Text style={styles.pickerLabel}>{dropdown.label}:</Text>
                          <View style={styles.pickerWrapper}></View>
                          <View style={{ flexDirection: "row" }}>
                            <Picker
                              selectedValue={dropdown.selected}
                              style={styles.picker}
                              onValueChange={dropdown.onChange}
                              dropdownIconColor="#DDD"
                              mode="dropdown"
                            >
                              {dropdown.options.map(opt => (
                                <Picker.Item label={opt} value={opt} key={opt} style={styles.pickerItem} />
                              ))}
                            </Picker>
                          </View>
                        </View>
                      </View>
                    </View>
                    );
                  })}
                </View>

                <View style={styles.dropdownColumn}>
                  {/* Texture, Formality, Favorite */}
                  {[ {
                    label: "Formality",
                    options: ["Casual", "Business Casual", "Formal"],
                    onChange: (value: string) => updatePickerValue(5, value),
                    selected: pickerValues[5],
                  }, {
                    label: "Favorite",
                    options: ["Yes", "No"],
                    onChange: (value: string) => updatePickerValue(8, value),
                    selected: pickerValues[8],
                  }, {
                    label: "Texture",
                    options: ["Cotton", "Denim", "Wool", "Linen", "Fleece", "Leather", "Suede"],
                    onChange: (value: string) => updatePickerValue(3, value),
                    selected: pickerValues[3],
                  }].map((dropdown, index) => {
                    if (dropdown.label === "Texture" && selectedType === "Accessories") return null;
                  
                    return (

                    <View key={index} style={{ alignItems: "center" }}>
                      <View style={styles.dropShadow} />
                      <View style={styles.centeredPickerContainer}>
                        <View style={{ flexDirection: "column" }}>
                          <Text style={styles.pickerLabel}>{dropdown.label}:</Text>
                          <View style={styles.pickerWrapper}></View>
                          <View style={{ flexDirection: "row" }}>
                            <Picker
                              selectedValue={dropdown.selected}
                              style={styles.picker}
                              onValueChange={dropdown.onChange}
                              dropdownIconColor="#DDD"
                              mode="dropdown"
                            >
                              {dropdown.options.map(opt => (
                                <Picker.Item label={opt} value={opt} key={opt} style={styles.pickerItem} />
                              ))}
                            </Picker>
                          </View>
                        </View>
                      </View>
                    </View>
                    );
                  })}
                </View>
              </View>

              <View style={{ marginTop: 20 }}>
                <GradientButton title="Upload" onPress={() => {
                  if (!isUploading) {
                    handleUpload();
                  }
                }} size="medium" />
              </View>
            </>
          )}
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