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
import StyledText from "../components/StyledText";



const PhotoUpload = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isPredicting, setIsPredicting] = useState<boolean>(false);
  const [pickerValues, setPickerValues] = useState<string[]>(Array(9).fill(""));
  const [selectedHexColor, setSelectedHexColor] = useState<string>("#000000");
  const [step, setStep] = useState<"color" | "tags">("color");
  const [remoteUrl, setRemoteUrl] = useState<string | null>(null);
  

  const styleInfoMap: Record<
    string,
    {
      type: string;
      formality: string;
      texture: string;
    }> = 
    {
      // Tops
      "T-Shirt": { type: "Tops", formality: "Casual", texture: "Cotton" },
      "Long Sleeve Shirt": { type: "Tops", formality: "Business Casual", texture: "Cotton" },
      "Blouse": { type: "Tops", formality: "Formal", texture: "Linen" },
      "Tank Top": { type: "Tops", formality: "Casual", texture: "Cotton" },
      "Polo": { type: "Tops", formality: "Business Casual", texture: "Cotton" },
      "Button-Up Shirt": { type: "Tops", formality: "Formal", texture: "Cotton" },
      "Dress": { type: "Tops", formality: "Formal", texture: "Linen" },

      // Bottoms
      "Jeans": { type: "Bottoms", formality: "Casual", texture: "Denim" },
      "Chinos": { type: "Bottoms", formality: "Business Casual", texture: "Cotton" },
      "Shorts": { type: "Bottoms", formality: "Casual", texture: "Cotton" },
      "Trousers": { type: "Bottoms", formality: "Formal", texture: "Wool" },
      "Joggers": { type: "Bottoms", formality: "Casual", texture: "Fleece" },
      "Leggings": { type: "Bottoms", formality: "Casual", texture: "Cotton" },
      "Skirt": { type: "Bottoms", formality: "Formal", texture: "Linen" },

      // Outerwear
      "Jacket": { type: "Outerwear", formality: "Casual", texture: "Leather" },
      "Blazer": { type: "Outerwear", formality: "Formal", texture: "Wool" },
      "Coat": { type: "Outerwear", formality: "Formal", texture: "Wool" },
      "Vest": { type: "Outerwear", formality: "Business Casual", texture: "Cotton" },
      "Windbreaker": { type: "Outerwear", formality: "Casual", texture: "Nylon" },
      "Raincoat": { type: "Outerwear", formality: "Casual", texture: "Nylon" },
      "Hoodie": { type: "Outerwear", formality: "Casual", texture: "Fleece" },
      "Sweatshirt": { type: "Outerwear", formality: "Casual", texture: "Fleece" },
      "Sweater": { type: "Outerwear", formality: "Business Casual", texture: "Wool" },

      // Footwear
      "Sneakers": { type: "Footwear", formality: "Casual", texture: "Leather" },
      "Boots": { type: "Footwear", formality: "Casual", texture: "Suede" },
      "Dress Shoes": { type: "Footwear", formality: "Formal", texture: "Leather" },
      "Loafers": { type: "Footwear", formality: "Business Casual", texture: "Leather" },
      "Sandals": { type: "Footwear", formality: "Casual", texture: "Leather" },
      "Heels": { type: "Footwear", formality: "Formal", texture: "Leather" },

      // Accessories
      "Hat": { type: "Accessories", formality: "Casual", texture: "Wool" },
      "Belt": { type: "Accessories", formality: "Formal", texture: "Leather" },
      "Scarf": { type: "Accessories", formality: "Casual", texture: "Wool" },
      "Gloves": { type: "Accessories", formality: "Casual", texture: "Leather" },
      "Sunglasses": { type: "Accessories", formality: "Casual", texture: "Plastic" },
      "Watch": { type: "Accessories", formality: "Business Casual", texture: "Metal" },
      "Tie": { type: "Accessories", formality: "Formal", texture: "Silk" },
    };

  const typeToStylesMap: Record<string, string[]> = Object.values(styleInfoMap).reduce((acc, { type }, index, arr) => {
    const style = Object.keys(styleInfoMap)[index];
    if (!acc[type]) acc[type] = [];
    acc[type].push(style);
    return acc;
  }, {} as Record<string, string[]>);
    

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
      setRemoteUrl(downloadUrl);
      console.log("✅ Image uploaded! Download URL:", downloadUrl);

      const userId = await getCurrentUserId();
      console.log("✅ Got user ID:", userId);

      if (!userId) throw new Error("User not logged in");

      // for predicting the tags
      console.log("🔮 Predicting tags...");
      const predictedTags = await predictTags(downloadUrl);
      console.log('🎯 Predicted tags:', predictedTags);

      const predictedStyle = predictedTags.type || "T-Shirt";   
      const patternValue = predictedTags.pattern || "Solid";

      console.log("🛠️ Setting predicted values...");
      const styleInfo = styleInfoMap[predictedStyle];
      const mappedType = styleInfo?.type || "Tops";
      const formalityValue = styleInfo?.formality || "Casual";
      const textureValue = styleInfo?.texture || patternValue;

      setSelectedType(mappedType);

      const validStyles = typeToStylesMap[mappedType] || [];
      const matchedStyle = validStyles.includes(predictedStyle) ? predictedStyle : validStyles[0];

      setSelectedType(mappedType);

      const matchedStyleInfo = styleInfoMap[matchedStyle];
      const autoTexture = matchedStyleInfo?.texture || patternValue;
      const autoFormality = matchedStyleInfo?.formality || "Casual";

      setPickerValues(prev => {
        const updated = [...prev];
        updated[0] = mappedType;
        updated[1] = matchedStyle;
        updated[2] = selectedHexColor;
        updated[3] = autoTexture;      
        updated[5] = autoFormality;    
        updated[6] = "M";
        updated[8] = "No";
        return updated;
      });

      setStep("tags");
      console.log("🏁 Finished handleUpload!");

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
        photoUrl: remoteUrl,
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
    <><View style={{ paddingTop: 40, alignItems: "center" }}>
      <StyledText size={32} variant="title">Photo Upload</StyledText>
    </View>
    <View style={globalStyles.container}>
        {!selectedImage && !isUploading && (
          <GradientButton
            title="Upload a Photo"
            subtitle="Select from Camera Roll"
            onPress={handleSelectPhoto} />
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
                      discrete={false} 
                      autoResetSlider={false} 
                      shadeWheelThumb={true} 
                      shadeSliderThumb={true} 
                      useNativeDriver={true} 
                      palette={[
                        "#fdf6e3",
                        "#f5e8d0",
                        "#e9d5b8",
                        "#d4bda0",
                        "#c1a78c",
                        "#a98977",
                        "#92735e",
                        "#7c5c45",
                      ]} />
                  </View>
                </View>

                <View style={{ marginTop: 30 }}>
                  <GradientButton
                    title="Next"
                    onPress={async () => {
                      updatePickerValue(2, selectedHexColor);
                      await handleUpload();
                    } }
                    size="medium" />
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
                      options={Object.keys(typeToStylesMap)}
                      value={selectedType}
                      onChange={value => {
                        setSelectedType(value);
                        updatePickerValue(0, value);
                        const stylesForType = typeToStylesMap[value];
                        if (stylesForType && stylesForType.length > 0) {
                          updatePickerValue(1, stylesForType[0]);
                        }
                      } } />

                    <Dropdown
                      label="Style"
                      options={typeToStylesMap[selectedType] || []}
                      value={pickerValues[1]}
                      onChange={value => {
                        const info = styleInfoMap[value];
                        const updated = [...pickerValues];
                        updated[1] = value;
                        if (info) {
                          updated[3] = info.texture;
                          updated[5] = info.formality;
                        }
                        setPickerValues(updated);
                      } } />

                    {/* Size */}
                    {selectedType !== "Accessories" && (
                      <Dropdown
                        label="Size"
                        options={["XS", "S", "M", "L", "XL"]}
                        value={pickerValues[6]}
                        onChange={value => updatePickerValue(6, value)} />
                    )}
                  </View>

                  {/* Texture, Formality, Favorite */}
                  <View style={styles.dropdownColumn}>
                    <Dropdown
                      label="Formality"
                      options={["Casual", "Business Casual", "Formal"]}
                      value={pickerValues[5]}
                      onChange={value => updatePickerValue(5, value)} />
                    <Dropdown
                      label="Favorite"
                      options={["Yes", "No"]}
                      value={pickerValues[8]}
                      onChange={value => updatePickerValue(8, value)} />

                    {selectedType !== "Accessories" && (
                      <Dropdown
                        label="Texture"
                        options={["Cotton", "Denim", "Wool", "Linen", "Fleece", "Leather", "Suede"]}
                        value={pickerValues[3]}
                        onChange={value => updatePickerValue(3, value)} />
                    )}
                  </View>
                </View>

                <View style={{ marginTop: 20 }}>
                  <GradientButton title="Upload" onPress={() => {
                    if (!isUploading) {
                      handleSave();
                    }
                  } } size="medium" />
                </View>
              </>
            )}
          </>
        )}
      </View></>
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
    width: '100%', 
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