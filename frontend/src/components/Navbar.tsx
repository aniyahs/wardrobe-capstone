import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

interface NavbarProps {
  setScreen: (screen: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ setScreen }) => {
  return (
    <View style={styles.navbar}>
      <Pressable onPress={() => setScreen("Home")} style={styles.navButton}>
        <Text style={styles.navText}>Home</Text>
      </Pressable>
      <Pressable onPress={() => setScreen("Login")} style={styles.navButton}>
        <Text style={styles.navText}>Login</Text>
      </Pressable>
      <Pressable onPress={() => setScreen("Signup")} style={styles.navButton}>
        <Text style={styles.navText}>Signup</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#222",
    padding: 15,
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
  navButton: {
    padding: 10,
  },
  navText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default Navbar;
