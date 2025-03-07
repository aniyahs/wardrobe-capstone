import React, {useEffect} from "react";
import { View, Text, TouchableOpacity, Button, Alert } from "react-native";
import { globalStyles } from "../styles/styles"; // Import the global styles
import Signup from "./Signup";
import Login from "./Login";
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';

interface LandingPageProps {
  setScreen: (screen: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ setScreen }) => {

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '204328910227-u0oa5f5rk9ocd64ie97sp8f4bbb41c71.apps.googleusercontent.com', 
    });
    }, []);

  async function onGoogleButtonPress() {
      // Check if your device supports Google Play
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      // Get the users ID token
    const signInResult = await GoogleSignin.signIn();
    
      // Try the new style of google-sign in result, from v13+ of that module
    let idToken = signInResult.data!.idToken;

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
       <TouchableOpacity 
        style={globalStyles.button} 
        onPress={() => onGoogleButtonPress().then(() => console.log('Signed in with Google!'))}>
          <Text style={globalStyles.buttonText}>Sign in with Google</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LandingPage;
