import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { globalStyles } from "../styles/styles";
import { signupUser } from "../api/authService"; // Import signup API

const Signup = ({ setScreen }: { setScreen: (screen: string) => void }) => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleSignup = async () => {
        if (!username || !email || !password) {
            setMessage("Please enter username, email, and password.");
            return;
        }

        try {
            const response = await signupUser(username, email, password);
            setMessage(response.message); // Show success message
            setTimeout(() => setScreen("Login"), 1500); // Redirect to login
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Signup failed");
        }
    };

    return (
        <View style={globalStyles.container}>
            <Text style={globalStyles.title}>Sign Up</Text>

            <TextInput
                style={globalStyles.input}
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
            />
            <TextInput
                style={globalStyles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
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
