import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { launchImageLibrary } from "react-native-image-picker";  // Import the image picker
import { globalStyles } from "../styles/styles";

const PhotoUpload = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Function to handle image selection
  const handleSelectPhoto = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',  // Specify that we want photos only (no videos)
        quality: 0.5,  // Set the image quality (optional)
        includeBase64: false,  // Set whether we want base64 encoding (optional)
      },
      (response) => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.errorCode) {
          Alert.alert('Error', 'Image picker error: ' + response.errorMessage);
        } else {
          // Set the selected image URI to state
          if (response.assets && response.assets[0].uri) {
            setSelectedImage(response.assets[0].uri);
          } else {
            Alert.alert('Error', 'No image selected');
          }
        }
      }
    );
  };

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Upload a Photo</Text>

      <TouchableOpacity onPress={handleSelectPhoto} style={globalStyles.uploadButton}>
        <Text style={globalStyles.uploadButtonText}>Select Photo</Text>
      </TouchableOpacity>

      {selectedImage && (
        <Image source={{ uri: selectedImage }} style={globalStyles.imagePreview} />
      )}
    </View>
  );
};

export default PhotoUpload;
