import React, { useState, useEffect } from "react";
import { View, Text } from "react-native";
import Navbar from "./src/components/Navbar";
import Header from "./src/components/Header";
import LandingPage from "./src/pages/LandingPage"; 
import Login from "./src/pages/Login";
import Signup from "./src/pages/Signup";
import Gallery from "./src/pages/Gallery";
import PhotoUpload from "./src/pages/PhotoUpload";
import Outfit from "./src/pages/OutfitSelector";
import Profile from "./src/pages/Profile";
import Home from "./src/pages/Home";
import Weather from "./src/components/Weather";
import Background from "./src/components/Background";
import StyledText from "./src/components/StyledText";
import { globalStyles } from "./src/styles/styles";
import { ClothingProvider } from "./src/api/wardrobeService";
import CustomOutfitBuilder from "./src/pages/CustomOutfitBuilder";

interface AppProps {
  setScreen: (screen: string) => void;
}

const App: React.FC<AppProps> = () => {
  const [screen, setScreen] = useState("Landing"); // Default screen is Landing
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login status

  // Handle login
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setScreen("Home"); // Navigate to Home screen after login
  };

  // Render the current screen
  const renderScreen = () => {
    switch (screen) {
      case "Login":
        return <Login setScreen={setScreen} handleLoginSuccess={handleLoginSuccess} />;
      case "Signup":
        return <Signup setScreen={setScreen} />;
      case "Gallery":
        return <Gallery />;
      case "Upload":
        return <PhotoUpload />;
      case "Profile":
        return <Profile />;
      case "Outfit":
        return <Outfit />;
      case "Landing":
        return <LandingPage setScreen={setScreen} />;
      case "Home":
        return <Home setScreen={setScreen}/>;
      case "CustomOutfitBuilder":
        return <CustomOutfitBuilder setScreen={setScreen} />;        
      default:
        return (
          <View style={globalStyles.container}>
            <Text style={globalStyles.title}>Welcome to the App</Text>
            {/* <Weather /> We got rate limited from too many requests*/}
          </View>
        );
    }
  };

  return (
    <ClothingProvider>
    <View style={{ flex: 1, position: "relative" }}>
      <Background />
  
      <View style={globalStyles.container}>
        {renderScreen()}
      </View>
  
      {isLoggedIn && (
        <>
          <Navbar setScreen={setScreen} />
          <Header setScreen={setScreen} />
        </>
      )}
    </View>
    </ClothingProvider>
  );
};

export default App;
