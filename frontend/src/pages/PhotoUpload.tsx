import React, { useState } from "react";
import { View, Text, Image, Alert } from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import { globalStyles } from "../styles/styles";
import { uploadImageToStorage } from "../components/Firebase";
import { savePhotoUrl } from "../api/uploadService";
import { getCurrentUserId } from "../api/authService";
import GradientButton from "../components/GradientButton";

const PhotoUpload = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleSelectPhoto = () => {
    launchImageLibrary(
      {
        mediaType: "photo",
        quality: 0.5,
        includeBase64: false,
      },
      async (response) => {
        if (response.didCancel) {
          console.log("User cancelled image picker");
        } else if (response.errorCode) {
          Alert.alert("Error", "Image picker error: " + response.errorMessage);
        } else if (response.assets && response.assets[0]?.uri) {
          const imageUri = response.assets[0].uri;
          setSelectedImage(imageUri);
      
          let downloadUrl = null;
          let userId = null;
      
          try {
            // Upload to Firebase
            downloadUrl = await uploadImageToStorage(imageUri);
            console.log("✅ Upload complete. Download URL:", downloadUrl);
          } catch (uploadErr) {
            console.error("❌ Failed to upload to Firebase:", uploadErr);
            Alert.alert("Upload Failed", "Could not upload image to storage.");
            return;
          }
      
          try {
            // Get user ID
            userId = await getCurrentUserId();
            if (!userId) {
              throw new Error("User ID not found");
            }
          } catch (userErr) {
            console.error("❌ Failed to get user ID:", userErr);
            Alert.alert("Authentication Error", "User not logged in.");
            return;
          }
      
          try {
            // Send to Flask backend
            console.log("📡 Saving photo to Flask backend...", { userId, downloadUrl });
            await savePhotoUrl(userId, downloadUrl);
            Alert.alert("Success", "Image uploaded and saved to MongoDB!");
          } catch (saveErr) {
            console.error("❌ Failed to save to backend:", {
              error: saveErr,
              userId,
              downloadUrl,
            });
            Alert.alert(
              "Save Failed",
              `Could not save to backend.\nUser ID: ${userId}\nURL: ${downloadUrl}`
            );
          }
        } else {
          Alert.alert("Error", "No image selected");
        }
      }
    );
  };

  return (
    <View style={globalStyles.container}>
      <GradientButton
        title="Upload a Photo"
        subtitle="Select from Camera Roll"
        onPress={handleSelectPhoto}
      />

      {selectedImage && (
        <Image source={{ uri: selectedImage }} style={globalStyles.imagePreview} />
      )}
    </View>
  );
};

export default PhotoUpload;
