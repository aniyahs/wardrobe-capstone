import React from "react";
import { Text, TouchableOpacity, StyleSheet, StyleProp, ViewStyle, View, Platform } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import StyledText from "./StyledText";

interface GradientButtonProps {
  title: string;
  subtitle?: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

const GradientButton: React.FC<GradientButtonProps> = ({ title, subtitle, onPress, style }) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={[styles.shadowContainer, style]}>
      {/* Fake Shadow Layer for Android */}
      {Platform.OS === "android" && <View style={styles.androidShadow} />}

      {/* Main Button */}
      <View style={styles.buttonWrapper}>
        <LinearGradient
          colors={["#6C6A67", "#3F342E"]}
          start={{ x: 0.75, y: 1 }}
          end={{ x: 0.25, y: 0 }}
          style={styles.button}
        >
          {/* Overlay with 83% Opacity */}
          <View style={styles.overlay} />

          {/* Text */}
          <StyledText size={34} variant="title">{title}</StyledText>
          {subtitle && <StyledText size={18} variant="subtitle">{subtitle}</StyledText>}
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
    shadowContainer: {
      justifyContent: "center",
      alignItems: "center",
    },
    buttonWrapper: {
      width: 296,
      height: 105,
      borderRadius: 28,
      overflow: "visible",
      backgroundColor: "transparent",
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.7,
          shadowRadius: 16,
        },
        android: {
          elevation: 20, 
        },
      }),
    },
    /** ✅ Fake Shadow Layer for Android */
    androidShadow: {
      position: "absolute",
      width: 296,
      height: 105,
      borderRadius: 28,
      backgroundColor: "rgba(0, 0, 0, 0.6)", 
      bottom: -5, // Offsets downward
      left: 0,
      right: 0,
      zIndex: -1, // Places it behind the button
    },
    button: {
      width: 296,
      height: 105,
      borderRadius: 28,
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden",
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "#3F342E",
      opacity: 0.83,
      borderRadius: 28,
    },
  });

export default GradientButton;
