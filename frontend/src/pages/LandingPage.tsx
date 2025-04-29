import React, {useEffect} from "react";
import { View, Text, TouchableOpacity, Button, Alert } from "react-native";
import { globalStyles } from "../styles/styles"; 
import GradientButton from "../components/GradientButton"

interface LandingPageProps {
  setScreen: (screen: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ setScreen }) => {
  
  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Welcome to Our App</Text>
      <GradientButton title="Login" onPress={() => setScreen("Login")} size="medium" />
      <GradientButton title="Signup" onPress={() => setScreen("Signup")} size="medium" />
    </View>
  );
};

export default LandingPage;
