import React from "react";
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
import storage from '@react-native-firebase/storage';
import { launchImageLibrary, MediaType, PhotoQuality, Asset } from 'react-native-image-picker';


// Utility to extract filename from path
const getFileNameFromPath = (path: string): string => {
    return path.split('/').pop() || `file_${Date.now()}`;  // Fallback to timestamp if needed
};

// Upload image to Firebase Storage
export const uploadImageToStorage = async (path: string): Promise<string> => {
    const fileName = getFileNameFromPath(path);
    const reference = storage().ref(fileName);

    try {
        await reference.putFile(path);
        console.log('✅ Image uploaded to Firebase Storage!');
        const downloadURL = await reference.getDownloadURL();
        return downloadURL;
    } catch (error: any) {
        console.error('❌ Error uploading image:', error);
        throw new Error(`Upload failed: ${error.message}`);
    }
};

export const savePhotoUrlToMongo = async (userId: string, photoUrl: string): Promise<void> => {
    try {
        console.log('📡 Sending request to:', 'http://10.0.2.2:4000/api/photos');
        console.log('📡 Request body:', JSON.stringify({ userId, photoUrl }));

        const response = await fetch('http://10.0.2.2:4000/api/photos', {  
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, photoUrl }),
        });

        console.log('📡 Response status:', response.status);
        
        const data = await response.json();
        console.log('✅ Server response:', data);

        if (!response.ok) {
            console.error('❌ Failed to save photo:', data.message);
            Alert.alert('MongoDB Save Failed', data.message);
        }
    } catch (error) {
        console.error('❌ Network error saving photo URL:', error);
        Alert.alert('Network Error', 'Failed to reach backend.');
    }
};



type State = {
    imagePath: string | null;
    isLoading: boolean;
    status: string;
};

export default class Firebase extends React.Component<{}, State> {

    state: State = {
        imagePath: null,
        isLoading: false,
        status: '',
    };

    chooseFile = () => {
        this.setState({ status: '', isLoading: true });

        const options = {
            mediaType: 'photo' as MediaType,
            maxWidth: 1024,
            maxHeight: 1024,
            quality: 0.75 as PhotoQuality,
        };

        launchImageLibrary(options, (response) => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
                this.setState({ isLoading: false });
            } else if (response.errorMessage) {
                console.log('ImagePicker Error:', response.errorMessage);
                this.setState({ status: 'Image picker error', isLoading: false });
            } else if (response.assets && response.assets.length > 0) {
                const asset = response.assets[0];
                if (!asset.uri) {
                    this.setState({ status: 'Failed to get image path', isLoading: false });
                    return;
                }

                const path = this.getPlatformPath(asset.uri);
                this.setState({ imagePath: path }, () => uploadImageToStorage(path));
            } else {
                this.setState({ isLoading: false });
            }
        });
    };

    
    

    getPlatformPath = (uri: string): string => {
        return Platform.OS === 'android' ? uri : uri.replace('file://', '');
    };

    render() {
        const { imagePath, isLoading, status } = this.state;
        const imgSource = imagePath ? { uri: imagePath } : null;
    
        return (
            <SafeAreaView style={styles.container}>
                {isLoading && <ActivityIndicator size="large" style={styles.loadingIndicator} />}
                <View style={styles.imgContainer}>
                    <Text style={styles.boldTextStyle}>{status}</Text>
                    {imgSource ? (
                        <Image style={styles.uploadImage} source={imgSource} />
                    ) : (
                        <Text>No image selected</Text>  // Optional placeholder text if no image is selected
                    )}
                    <View style={styles.eightyWidthStyle}>
                        <Button title="Upload Image" onPress={this.chooseFile} />
                    </View>
                </View>
            </SafeAreaView>
        );
    }    
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: '#e6e6fa',
    },
    imgContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    eightyWidthStyle: {
        width: '80%',
        margin: 2,
    },
    uploadImage: {
        width: '80%',
        height: 300,
    },
    loadingIndicator: {
        zIndex: 5,
        width: '100%',
        height: '100%',
    },
    boldTextStyle: {
        fontWeight: 'bold',
        fontSize: 22,
        color: '#5EB0E5',
    },
});
