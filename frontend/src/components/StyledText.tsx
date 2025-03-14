import React from "react";
import { Text, StyleSheet, TextProps } from "react-native";
import * as Font from "expo-font";

interface StyledTextProps extends TextProps {
  size: number; // Font size passed dynamically
  variant?: "title" | "subtitle"; // Default is "title"
}

const StyledText: React.FC<StyledTextProps> = ({ size, variant = "title", style, children, ...props }) => {
  return (
    <Text
      style={[styles[variant], { fontSize: size }, style]} // Apply dynamic font size
      {...props}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  title: {
    fontWeight: "bold",
    color: "#EEE",
    textShadowColor: "rgba(0, 0, 0, 0.7)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
    textAlign: "center",
    marginBottom: 5,
  },
  subtitle: {
    fontFamily: "Inter",
    color: "#DDD",
    textShadowColor: "rgba(0, 0, 0, 0.7)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
    textAlign: "center",
  },
});

export default StyledText;
