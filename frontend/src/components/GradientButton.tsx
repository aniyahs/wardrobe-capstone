import React from "react";
import { Text, TouchableOpacity, StyleSheet, StyleProp, ViewStyle, View, Platform } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import StyledText from "./StyledText";

type ButtonSize = "small" | "medium" | "large";

interface GradientButtonProps {
  title: string;
  subtitle?: string;
  onPress: () => void;
  size?: ButtonSize; 
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

const GradientButton: React.FC<GradientButtonProps> = ({ title, subtitle, onPress, size = "large", style, disabled }) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={[styles.shadowContainer, style, disabled && styles.disabledButton]}>
      {/* Fake Shadow Layer for Android */}
      {Platform.OS === "android" && <View style={[styles.androidShadow, buttonSizes[size].shadow]} />}

      {/* Main Button */}
      <View style={[styles.buttonWrapper, buttonSizes[size].button]}>
        <LinearGradient
          colors={["#6C6A67", "#3F342E"]}
          start={{ x: 0.75, y: 1 }}
          end={{ x: 0.25, y: 0 }}
          style={{ ...(buttonSizes[size].button as ViewStyle) }} 
        >
          {/* Overlay with 83% Opacity */}
          <View style={[styles.overlay, { borderRadius: buttonSizes[size].button.borderRadius }]} />

          {/* Text */}
          <StyledText size={buttonSizes[size].textSize} variant="title">{title}</StyledText>
          {subtitle && <StyledText size={buttonSizes[size].subtitleSize} variant="subtitle">{subtitle}</StyledText>}
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );
};

/** Button size configurations */
const buttonSizes = {
  small: {
    button: {
      padding: 8,
      borderRadius: 5,
      alignItems: "center",
      marginBottom: 0
    } as ViewStyle, 
    textSize: 14, 
    subtitleSize: 12, 
    shadow: {
      width: 95.5,
      height: 40,
      borderRadius: 5,
      bottom: 0,
      left: 8,
      top: 11.5,
    } as ViewStyle,
  },
  medium: {
    button: {
      padding: 12,
      marginTop: 0,
      marginBottom: -5,
      borderRadius: 10,
      width: 200,
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden",
    } as ViewStyle,
    textSize: 16,
    subtitleSize: 14,
    shadow: {
      width: 200,
      height: 50,
      borderRadius: 10,
      bottom: 0,
        top: 18,
    } as ViewStyle,
  },
  large: {
    button: {
      width: 296,
      height: 105,
      borderRadius: 28,
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden",
    } as ViewStyle,
    textSize: 34,
    subtitleSize: 18,
    shadow: {
      width: 296,
      height: 105,
      borderRadius: 28,
      bottom: -5,
    } as ViewStyle,
  },
};

const styles = StyleSheet.create({
  shadowContainer: {
    justifyContent: "center",
    alignItems: "center",
  },

  /** Fake Shadow Layer for Android */
  androidShadow: {
    position: "absolute",
    backgroundColor: "rgba(0, 0, 0, 0.4)", // Super dark black shadow
    left: 0,
    right: 0,
    zIndex: -1,
  },

  buttonWrapper: {
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
        elevation: 0, // Still needed for soft shadow
      },
    }),
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#3F342E",
    opacity: 0.83,
  },

  disabledButton: {
    opacity: 0.5,
  },
});

export default GradientButton;
