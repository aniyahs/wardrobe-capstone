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
import { predictTags } from "../api/predictService";


const PhotoUpload = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isPredicting, setIsPredicting] = useState<boolean>(false);
  const [pickerValues, setPickerValues] = useState<string[]>(Array(9).fill(""));
  const [selectedHexColor, setSelectedHexColor] = useState<string>("#000000");
  const [step, setStep] = useState<"color" | "tags">("color");

  const styleOptionsMap: Record<string, string[]> = {
    Tops: ["T-Shirt", "Long Sleeve Shirt", "Blouse", "Tank Top", "Polo", "Button-Up Shirt", "Dress"],
    Bottoms: ["Jeans", "Chinos", "Shorts", "Trousers", "Joggers", "Leggings", "Skirt"],
    Outerwear: ["Jacket", "Blazer", "Coat", "Vest", "Windbreaker", "Raincoat", "Hoodie", "Sweatshirt", "Sweater"],
    Footwear: ["Sneakers", "Boots", "Dress Shoes", "Loafers", "Sandals", "Heels"],
    Accessories: ["Hat", "Belt", "Scarf", "Gloves", "Sunglasses", "Watch", "Tie"],
  };

  const reverseStyleToTypeMap: Record<string, string> = {
    "T-Shirt": "Tops", "Long Sleeve Shirt": "Tops", "Blouse": "Tops", "Tank Top": "Tops", "Polo": "Tops", "Button-Up Shirt": "Tops", "Dress": "Tops",
    "Jeans": "Bottoms", "Chinos": "Bottoms", "Shorts": "Bottoms", "Trousers": "Bottoms", "Joggers": "Bottoms", "Leggings": "Bottoms", "Skirt": "Bottoms",
    "Jacket": "Outerwear", "Blazer": "Outerwear", "Coat": "Outerwear", "Vest": "Outerwear", "Windbreaker": "Outerwear", "Raincoat": "Outerwear", "Hoodie": "Outerwear", "Sweatshirt": "Outerwear", "Sweater": "Outerwear",
    "Sneakers": "Footwear", "Boots": "Footwear", "Dress Shoes": "Footwear", "Loafers": "Footwear", "Sandals": "Footwear", "Heels": "Footwear",
    "Hat": "Accessories", "Belt": "Accessories", "Scarf": "Accessories", "Gloves": "Accessories", "Sunglasses": "Accessories", "Watch": "Accessories", "Tie": "Accessories"
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
      console.log("📤 Uploading image to Firebase...");
      const downloadUrl = await uploadImageToStorage(selectedImage);
      console.log("✅ Image uploaded! Download URL:", downloadUrl);

      const userId = await getCurrentUserId();
      console.log("✅ Got user ID:", userId);

      if (!userId) throw new Error("User not logged in");

      // for predicting the tags
      //setIsPredicting(true);
      console.log("🔮 Predicting tags...");
      const predictedTags = await predictTags(downloadUrl);
      console.log('🎯 Predicted tags:', predictedTags);
      //setIsPredicting(false);

      const predictedStyle = predictedTags.type || "T-Shirt";   
      const colorValue = predictedTags.color || "#000000";
      const patternValue = predictedTags.pattern || "Solid";

      console.log("🛠️ Setting predicted values...");
      const mappedType = reverseStyleToTypeMap[predictedStyle] || "Tops";
      setSelectedType(mappedType);

      const validStyles = styleOptionsMap[mappedType] || [];
      const matchedStyle = validStyles.includes(predictedStyle) ? predictedStyle : validStyles[0];

      setSelectedType(mappedType);

      setPickerValues(prev => {
        const updated = [...prev];
        updated[0] = mappedType;   // Make sure dropdown Type shows "Bottoms", etc
        updated[1] = matchedStyle; // Style ("Jeans", etc.)
        updated[2] = colorValue;
        updated[3] = patternValue;
        updated[5] = "Casual";
        updated[6] = "M";
        updated[8] = "No";
        return updated;
      });

      setStep("tags");
      console.log("🏁 Finished handleUpload!");

      // Now after prediction and setting values, save to Mongo
      // const itemData = {
      //   userId,
      //   photoUrl: downloadUrl,
      //   type: mappedType,
      //   style: matchedStyle,
      //   color: colorValue,
      //   texture: patternValue,
      //   formality: "Casual",
      //   size: "M",
      //   favorite: false,
      //   season: selectedSeason.length > 0 ? selectedSeason : ["Summer", "Fall", "Winter", "Spring"],
      // };

      // console.log("📡 Saving item:", itemData);
      // await savePhotoUrl(itemData);

      // Alert.alert("Success", "Item uploaded and saved!");
      // setSelectedImage(null);
      // setPickerValues(Array(9).fill(""));
      // setSelectedSeason([]);

    } catch (err) {
      console.error("❌ Upload failed:", err);
      Alert.alert("Upload Failed", "Could not upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    try{
      const userId = await getCurrentUserId();
      if(!userId) throw new Error("User not logged in");

      const itemData = {
        userId,
        photoUrl: selectedImage,
        type: pickerValues[0],
        style: pickerValues[1],
        color: pickerValues[2],
        texture: pickerValues[3],
        formality: pickerValues[5],
        size: pickerValues[6],
        favorite: pickerValues[8] === "Yes",
        season: selectedSeason.length > 0 ? selectedSeason : ["Summer", "Fall", "Winter", "Spring"],
      };

      console.log("Saving item in MongoDB: ", itemData);
      await savePhotoUrl(itemData);

      Alert.alert("Success", "Item saved to wardrobe!");
      setSelectedImage(null);
      setPickerValues(Array(9).fill(""));
      setSelectedSeason([]);
    } catch (err) {
      console.error("❌ Save failed:", err);
      Alert.alert("Save Failed", "Could not save item.");
    } 
  };

  const Dropdown = ({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) => (
    <View style={{ alignItems: "center" }}>
      <View style={styles.dropShadow} />
      <View style={styles.centeredPickerContainer}>
        <View style={{ flexDirection: "column", width: '100%' }}>
          <Text style={styles.pickerLabel}>{label}:</Text>
          <View style={styles.pickerWrapper} />
          <View style={{ flexDirection: "row" }}>
            <Picker
              selectedValue={value}
              style={styles.picker}
              onValueChange={onChange}
              dropdownIconColor="#DDD"
              mode="dropdown"
            >
              {options.map(opt => (
                <Picker.Item label={opt} value={opt} key={opt} style={styles.pickerItem} />
              ))}
            </Picker>
          </View>
        </View>
      </View>
    </View>
  );    

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

          {/* Color Picker */}
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
                  onPress={async () => {
                    updatePickerValue(2, selectedHexColor);
                    await handleUpload();
                  }}
                  size="medium"
                />
              </View>
            </>
          ) : (
            <>
            {/* Season Picker */}
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

              {/* DropDowns: Type / Style / Size */}
              <View style={styles.dropdownGrid}>
                <View style={styles.dropdownColumn}>
                  {/* Type */}
                  <Dropdown
                    label="Type"
                    options={Object.keys(styleOptionsMap)}
                    value={selectedType}
                    onChange={value => {
                      setSelectedType(value);
                      updatePickerValue(0, value);
                    }}
                  /> 
                  {/* Style */}
                    <Dropdown
                      label="Style"
                      options={styleOptionsMap[selectedType] || []}
                      value={pickerValues[1]}
                      onChange={value => updatePickerValue(1, value)}
                  /> 
                  {/* Size */}
                  {selectedType !== "Accessories" && (
                    <Dropdown
                      label="Size"
                      options={["XS", "S", "M", "L", "XL"]}
                      value={pickerValues[6]}
                      onChange={value => updatePickerValue(6, value)}
                  />
                )}
                </View>

                {/* Texture, Formality, Favorite */}
                <View style={styles.dropdownColumn}>
                  <Dropdown
                    label="Formality"
                    options={["Casual", "Business Casual", "Formal"]}
                    value={pickerValues[5]}
                    onChange={value => updatePickerValue(5, value)}
                  />
                  <Dropdown
                    label="Favorite"
                    options={["Yes", "No"]}
                    value={pickerValues[8]}
                    onChange={value => updatePickerValue(8, value)}
                  />

                  {selectedType !== "Accessories" && (
                    <Dropdown
                      label="Texture"
                      options={["Cotton", "Denim", "Wool", "Linen", "Fleece", "Leather", "Suede"]}
                      value={pickerValues[3]}
                      onChange={value => updatePickerValue(3, value)}
                    />
                  )}
                  </View>
                </View>

              <View style={{ marginTop: 20 }}>
                <GradientButton title="Upload" onPress={() => {
                  if (!isUploading) {
                    handleSave();
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