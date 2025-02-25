import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { globalStyles } from "../styles/styles";

const PhotoUpload = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleSelectPhoto = () => {
    // This function will later be implemented using an image picker.
    
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
