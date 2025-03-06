import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, Alert } from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import { globalStyles } from "../styles/styles";
import { uploadImageToStorage } from "../components/Firebase";
import { savePhotoUrlToMongo } from "../components/Firebase"; 

const PhotoUpload = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

const handleSelectPhoto = () => {
  launchImageLibrary(
    {
      mediaType: 'photo',
      quality: 0.5,
      includeBase64: false,
    },
    async (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        Alert.alert('Error', 'Image picker error: ' + response.errorMessage);
      } else if (response.assets && response.assets[0]?.uri) {
        const imageUri = response.assets[0].uri;
        setSelectedImage(imageUri);

        try {
          const downloadUrl = await uploadImageToStorage(imageUri);
          console.log('✅ Upload complete. Download URL:', downloadUrl);

          const userId = "your_actual_user_id";  // Replace with real user ID from auth
          console.log('📡 Calling savePhotoUrlToMongo...', { userId, downloadUrl });

          await savePhotoUrlToMongo(userId, downloadUrl);

          Alert.alert('Success', 'Image uploaded and saved to MongoDB!');
        } catch (err) {
          console.error('❌ Upload or save failed:', err);
          Alert.alert('Upload Failed', 'Could not upload image.');
        }
      } else {
        Alert.alert('Error', 'No image selected');
      }
    }
  );
};


  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Upload a Photo</Text>

      {/* The button to actually open the image picker */}
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
