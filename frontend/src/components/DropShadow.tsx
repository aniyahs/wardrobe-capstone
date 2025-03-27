import React from "react";
import {
  View,
  StyleSheet,
  Platform,
  StyleProp,
  ViewStyle,
} from "react-native";

interface BottomShadowProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;      // Style for the outer container
  contentStyle?: StyleProp<ViewStyle>; // Style for the content container (e.g., backgroundColor)
  shadowStyle?: StyleProp<ViewStyle>;  // Additional shadow style overrides
  borderRadius?: number;               // To round the bottom corners of the shadow & content
}

const BottomShadow: React.FC<BottomShadowProps> = ({
  children,
  style,
  contentStyle,
  shadowStyle,
  borderRadius = 10,
}) => {
  return (
    <View style={[styles.wrapper, style]}>
      {/* Android-specific fake shadow below the content */}
      {Platform.OS === "android" && (
        <View
          style={[
            styles.androidShadow,
            {
              borderBottomLeftRadius: borderRadius,
              borderBottomRightRadius: borderRadius,
            },
            shadowStyle,
          ]}
        />
      )}

      {/* Main content container */}
      <View
        style={[
          styles.content,
          { borderRadius },
          Platform.OS === "ios" && styles.iosShadow,
          contentStyle,
        ]}
      >
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center", // Centers the content horizontally
  },
  // Android shadow: a fake view underneath the content
  androidShadow: {
    position: "absolute",
    bottom: 0,
    width: "90%",      // Adjust based on how wide you want the shadow relative to your content
    height: 8,         // Height of the shadow effect
    backgroundColor: "rgba(0,0,0,0.4)",
    zIndex: -1,
  },
  // iOS shadow is applied directly to the content container
  iosShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  content: {
    // Default backgroundColor can be overwritten by contentStyle
    backgroundColor: "#3F342E",
    // Padding and other styling can be applied here or passed via contentStyle
  },
});

export default BottomShadow;
