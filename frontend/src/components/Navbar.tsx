import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { globalStyles } from "../styles/styles";

interface NavbarProps {
  setScreen: (screen: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ setScreen }) => {
  return (
    <View style={globalStyles.navbar}>
      <Pressable onPress={() => setScreen("Home")} style={globalStyles.navButton}>
        <Text style={globalStyles.navText}>Home</Text>
      </Pressable>
      {/*
        Leaving in case needed for testing

      <Pressable onPress={() => setScreen("Login")} style={globalStyles.navButton}>
        <Text style={globalStyles.navText}>Login</Text>
      </Pressable>
      <Pressable onPress={() => setScreen("Signup")} style={globalStyles.navButton}>
        <Text style={globalStyles.navText}>Signup</Text>
      </Pressable>*/}
      <Pressable onPress={() => setScreen("Gallery")} style={globalStyles.navButton}>
        <Text style={globalStyles.navText}>Gallery</Text>
      </Pressable>
      <Pressable onPress={() => setScreen("Upload")} style={globalStyles.navButton}>
        <Text style={globalStyles.navText}>Upload</Text>
      </Pressable>
      <Pressable onPress={() => setScreen("Profile")} style={globalStyles.navButton}>
        <Text style={globalStyles.navText}>Profile</Text>
      </Pressable>
    </View>
  );
};


export default Navbar;
