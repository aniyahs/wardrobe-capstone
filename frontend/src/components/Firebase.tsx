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
import { getApp } from "@react-native-firebase/app";


    // Utility to extract filename from path
    const getFileNameFromPath = (path: string): string => {
        return path.split('/').pop() || `file_${Date.now()}`;  // Fallback to timestamp if needed
    };

    // Upload image to Firebase Storage
    export const uploadImageToStorage = async (path: string): Promise<string> => {
        const fileName = getFileNameFromPath(path);
        const reference = storage(getApp()).ref(path);

        try {
            await reference.putFile(path);
            console.log('Image uploaded to Firebase Storage!');
            const downloadURL = await reference.getDownloadURL();
            return downloadURL;
        } catch (error: any) {
            console.error('Error uploading image:', error);
            throw new Error(`Upload failed: ${error.message}`);
        }
    };

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
