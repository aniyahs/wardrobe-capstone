import React, { useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import Navbar from "./src/components/Navbar";
import Login from "./src/Login";
import Signup from "./src/Signup";

const App = () => {
  const [screen, setScreen] = useState("Home"); // Default screen is 'Home'

  const renderScreen = () => {
    switch (screen) {
      case "Login":
        return <Signup />;
      case "Signup":
        return <Login />;
      default:
        return (
          <View style={styles.container}>
            <Text style={styles.title}>Welcome to the App</Text>
          </View>
        );
    }
  };

  return (
    <View style={styles.appContainer}>
      {renderScreen()}
      <Navbar setScreen={setScreen} />
    </View>
  );
};

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
});

export default App;
