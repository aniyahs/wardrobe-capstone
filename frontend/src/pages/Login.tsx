import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Button, Alert } from "react-native";
import { globalStyles } from "../styles/styles"; 
import { loginUser } from "../api/authService"; 
import StyledText from "../components/StyledText"; 
import GradientButton from "../components/GradientButton"
import { storeUserId  } from "../api/authService";


interface LoginProps {
  setScreen: (screen: string) => void;
  handleLoginSuccess: (username: string, userId: string) => void; 
}

const Login: React.FC<LoginProps> = ({ setScreen, handleLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }

    try {
      const response = await loginUser(email, password);
      await storeUserId(response.user_id);
      handleLoginSuccess(response.username, response.user_id); 
    } catch (error) {
      Alert.alert("Error", (error as Error).message);
    }
  };

  return (
    <View style={globalStyles.container}>
      <StyledText size={24} variant="title">Login</StyledText>
      <TextInput
        style={globalStyles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={globalStyles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <GradientButton title="Login" onPress={handleLogin} size="medium" />
    </View>
  );
};

export default Login;
