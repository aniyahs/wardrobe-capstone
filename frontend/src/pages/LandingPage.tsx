import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { globalStyles } from "../styles/styles"; // Import the global styles

interface LandingPageProps {
  setScreen: (screen: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ setScreen }) => {
  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Welcome to Our App</Text>
      
      <TouchableOpacity
        style={globalStyles.button}
        onPress={() => setScreen("Login")}
      >
        <Text style={globalStyles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={globalStyles.button}
        onPress={() => setScreen("Signup")}
      >
        <Text style={globalStyles.buttonText}>Signup</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LandingPage;
