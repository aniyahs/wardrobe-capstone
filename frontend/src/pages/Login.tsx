import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { globalStyles } from "../styles/styles"; // Import shared styles
import { loginUser } from "../api/authService"; // Import API function

interface LoginProps {
  setScreen: (screen: string) => void;
  handleLoginSuccess: () => void; // Callback function for login success
}

const Login: React.FC<LoginProps> = ({ setScreen, handleLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }

    // Simulate login if email and password are "a"
    if (email === "a" && password === "a") {
      handleLoginSuccess(); // Notify App.tsx that login was successful
      return; // Simulate successful login and return
    }

    // Otherwise, call the actual login function
    try {
      const response = await loginUser(email, password);
      Alert.alert("Success", response.message); // Show success message
      handleLoginSuccess(); // Notify App.tsx that login was successful
    } catch (error) {
      Alert.alert("Error", (error as Error).message);
    }
  };

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Login</Text>
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
      <TouchableOpacity style={globalStyles.button} onPress={handleLogin}>
        <Text style={globalStyles.buttonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Login;
