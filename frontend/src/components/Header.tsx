import React from "react";
import { Text, View, StyleSheet, Platform, Image, TouchableOpacity } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import StyledText from "./StyledText";

interface HeaderProps {
    setScreen: (screen: string) => void;
  }
  
  const Header: React.FC<HeaderProps> = ({ setScreen }) => {

  return (
    <View style={styles.shadowContainer}>
      {/* Fake Shadow Layer for Android */}
      {Platform.OS === "android" && <View style={styles.androidShadow} />}

      {/* Main Header */}
      <View style={styles.headerWrapper}>
        <LinearGradient
          colors={["#6C6A67", "#3F342E"]}
          start={{ x: 0.75, y: 1 }}
          end={{ x: 0.25, y: 0 }}
          style={styles.header}
        >
          {/* Overlay with 83% Opacity */}
          <View style={styles.overlay} />

          {/* Left Empty Space (for spacing) */}
          <View style={styles.sideSpacer} />

          {/* Centered Title */}
          <StyledText onPress={() => setScreen("Home")} size={34} variant="cursiveFont">WearWell</StyledText>

          {/* Right Side Placeholder for Image */}
          <View style={styles.imagePlaceholder}>
            <TouchableOpacity onPress={() => setScreen("Profile")}>
            <Image source={require("../assets/images/profile-icon.png")} style={styles.profileImage} />
            </TouchableOpacity>
            </View>
        </LinearGradient>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  shadowContainer: {
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 20, // ✅ Ensures placement at the top
    width: "100%",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.7,
        shadowRadius: 16,
      },
      android: {
        elevation: 20, // ✅ Stronger shadow for Android
      },
    }),
  },
  headerWrapper: {
    width: "90%",
    borderRadius: 28,
    overflow: "visible",
    backgroundColor: "transparent",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // ✅ Ensures left, center, and right alignment
    width: "100%",
    height: 46,
    borderRadius: 28,
    paddingHorizontal: 15,
  },
  /** ✅ Fake Shadow Layer for Android */
  androidShadow: {
    position: "absolute",
    width: "90%",
    height: 46,
    borderRadius: 28,
    backgroundColor: "rgba(0, 0, 0, 0.6)", // ✅ Super dark shadow
    bottom: -5, // ✅ Ensures proper elevation effect
    left: "5%",
    right: "5%",
    zIndex: -1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#3F342E",
    opacity: 0.83,
    borderRadius: 28,
  },
  sideSpacer: {
    width: 30, // ✅ Placeholder for left spacing
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#EEE",
    textShadowColor: "rgba(0, 0, 0, 0.7)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
    textAlign: "center",
    flex: 1, // ✅ Ensures text remains centered even when image is added
  },
  imagePlaceholder: {
    width: 30, // ✅ Same width as left spacer for symmetry
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  profileImage: {
    width: 30,
    height: 30,
    borderRadius: 15, // ✅ Circular image
  },
});

export default Header;
