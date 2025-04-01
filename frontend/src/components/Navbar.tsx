import React from "react";
import { Text, TouchableOpacity, StyleSheet, View, Platform } from "react-native";
import LinearGradient from "react-native-linear-gradient";

interface NavbarProps {
  setScreen: (screen: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ setScreen }) => {
  return (
    <View style={styles.shadowContainer}>
      {/* Fake Shadow Layer for Android */}
      {Platform.OS === "android" && <View style={styles.androidShadow} />}

      {/* Main Navbar */}
      <View style={styles.navbarWrapper}>
        <LinearGradient
          colors={["#6C6A67", "#3F342E"]}
          start={{ x: 0.75, y: 1 }}
          end={{ x: 0.25, y: 0 }}
          style={styles.navbar}
        >
          {/* Overlay with 83% Opacity */}
          <View style={styles.overlay} />

          <TouchableOpacity onPress={() => setScreen("Home")} style={styles.navButton}>
            <Text style={styles.navText}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setScreen("Gallery")} style={styles.navButton}>
            <Text style={styles.navText}>Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setScreen("Upload")} style={styles.navButton}>
            <Text style={styles.navText}>Upload</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setScreen("Outfit")} style={styles.navButton}>
            <Text style={styles.navText}>Outfit</Text>
          </TouchableOpacity>
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
    bottom: 30, // Ensure proper placement at the bottom
    width: "100%",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.7,
        shadowRadius: 16,
      },
      android: {
        elevation: 20, // Stronger shadow for Android
      },
    }),
  },
  navbarWrapper: {
    width: "90%",
    borderRadius: 28,
    overflow: "visible",
    backgroundColor: "transparent",
  },
  navbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
    height: 46, // Shorter height as per request
    borderRadius: 28,
    paddingHorizontal: 5,
  },
  /** ✅ Fake Shadow Layer for Android */
  androidShadow: {
    position: "absolute",
    width: "90%", // Matches the navbar width
    height: 46, // Matches the navbar height
    borderRadius: 28,
    backgroundColor: "rgba(0, 0, 0, 0.6)", // Super dark shadow
    bottom: -5, // Keeps it slightly below for depth
    left: "5%", // Centers the shadow (since width is 90%)
    right: "5%", // Ensures it's evenly distributed
    zIndex: -1, // Places it behind the navbar
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#3F342E",
    opacity: 0.83,
    borderRadius: 28,
  },
  navButton: {
    paddingVertical: 2,
    paddingHorizontal: 10,
  },
  navText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#EEE",
    textShadowColor: "rgba(0, 0, 0, 0.7)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
});

export default Navbar;
