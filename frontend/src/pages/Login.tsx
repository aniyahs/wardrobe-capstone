import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Button, Alert } from "react-native";
import { globalStyles } from "../styles/styles"; // Import shared styles
import { GoogleSignin } from '@react-native-google-signin/google-signin'; // Import Google Signin
import auth from '@react-native-firebase/auth'; // Import Firebase auth
import { loginUser } from "../api/authService"; // Import API function
import StyledText from "../components/StyledText"; // Import StyledText component
import GradientButton from "../components/GradientButton"

interface LoginProps {
  setScreen: (screen: string) => void;
  handleLoginSuccess: (username: string, userId: string) => void; // Pass user data on success
}

const Login: React.FC<LoginProps> = ({ setScreen, handleLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '204328910227-u0oa5f5rk9ocd64ie97sp8f4bbb41c71.apps.googleusercontent.com', 
    });
    }, []);

  async function onGoogleButtonPress() {
      
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      // create signInResult
    const signInResult = await GoogleSignin.signIn();
    
      // Get users ID token
    let idToken, user = signInResult.data!.idToken;

    console.log(idToken);
    Alert.alert("Success Login");
      
    if (!idToken) {
      throw new Error('No ID token found');
      }
    
    
      // Create a Google credential with the token
    const googleCredential = auth.GoogleAuthProvider.credential(signInResult.data!.idToken);
    console.log(signInResult.data?.idToken)
  
    // Sign-in the user with the credential
    return auth().signInWithCredential(googleCredential);
  }

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }

    try {
      const response = await loginUser(email, password);
      Alert.alert("Success", response.message); // Show success message
      handleLoginSuccess(response.username, response.user_id); // Pass user data to App.tsx
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
      <GradientButton title="Sign in with Google" onPress={() => onGoogleButtonPress().then(() => console.log('Signed in with Google!'))} size="medium" />
    </View>
  );
};

export default Login;
