import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { globalStyles } from "../styles/styles"; // Import shared styles

const Login = () => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = () => {
    if (!name || !password) {
      setMessage("Please enter your credentials.");
      return;
    }
    if (name === "test" && password === "password") {
      setMessage("Login successful!");
    } else {
      setMessage("Invalid credentials. Try again.");
    }
  };

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Login</Text>
      <TextInput style={globalStyles.input} placeholder="Name" value={name} onChangeText={setName} />
      <TextInput style={globalStyles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      {message ? <Text style={[globalStyles.message, message.includes("successful") ? globalStyles.successMessage : globalStyles.errorMessage]}>{message}</Text> : null}
      <TouchableOpacity style={globalStyles.button} onPress={handleLogin}>
        <Text style={globalStyles.buttonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Login;
