import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { globalStyles } from "../styles/styles";

const Signup = ({ setScreen }: { setScreen: (screen: string) => void }) => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSignup = () => {
    if (!name || !password) {
      setMessage("Please enter a name and password.");
      return;
    }

    // Placeholder for actual signup logic (e.g., API call)
    setMessage("Signup successful!");
    setName("");
    setPassword("");

    // Redirect to Login screen after successful signup
    setTimeout(() => setScreen("Login"), 1500);  
  };

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Sign Up</Text>

      <TextInput
        style={globalStyles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={globalStyles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {message ? <Text style={globalStyles.message}>{message}</Text> : null}

      <TouchableOpacity style={globalStyles.button} onPress={handleSignup}>
        <Text style={globalStyles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setScreen("Login")}>
        <Text style={globalStyles.link}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Signup;
