import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import Navbar from './src/components/Navbar';
import LandingPage from './src/pages/LandingPage';  // Import the LandingPage component
import Login from './src/pages/Login';
import Signup from './src/pages/Signup';
import Gallery from './src/pages/Gallery';
import PhotoUpload from './src/pages/PhotoUpload';
import Outfit from './src/pages/OutfitSelector';
import Profile from './src/pages/Profile';
import Weather from './src/components/Weather';
import { globalStyles } from './src/styles/styles';
import { fetchAllUsers } from "./src/api/authService";

interface AppProps {
  setScreen: (screen: string) => void;
}

const App: React.FC<AppProps> = () => {
  const [screen, setScreen] = useState('Landing'); // Default screen is Landing
  const [isLoggedIn, setIsLoggedIn] = useState(false); // State to track login status
  const [users, setUsers] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const getUsers = async () => {
        try {
            const userList = await fetchAllUsers();
            setUsers(userList);
        } catch (err) {
            console.error("Error fetching users:", err);
            setError("Failed to load users.");
        }
    };

    getUsers();
}, []);


  // Function to handle login
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);  // Set the user as logged in
    setScreen('Home');    // Navigate to the Home screen after login
  };

  const renderScreen = () => {
    switch (screen) {      
      // Leaving login and signup in case needed for testing later
      // If needed, uncomment in navbar component
      case 'Login':
        return <Login setScreen={setScreen} handleLoginSuccess={handleLoginSuccess} />;
      case 'Signup':
        return <Signup setScreen={setScreen} />;
      case 'Gallery':
        return <Gallery />;
      case 'Upload':
        return <PhotoUpload />;
      case 'Profile':
        return <Profile />;
      case 'Outfit':
        return <Outfit />;
      case 'Landing':
        return <LandingPage setScreen={setScreen} />;
      case 'Home':
        return (
          <View style={globalStyles.container}>
            <Text style={globalStyles.title}>Welcome to the Home Screen</Text>
            <Weather />
          </View>
        );
      default:
        return (
          <View style={globalStyles.container}>
            <Text style={globalStyles.title}>Welcome to the App</Text>
            <Weather />
          </View>
        );
    }
  };

  return (
    <View style={globalStyles.container}>
      {renderScreen()}
      {/* Make Sure to Remove before commit********************************************************************************  */}
      <Text style={globalStyles.subtitle}>Registered Users:</Text>
            {error ? (
                <Text style={{ color: "red" }}>{error}</Text>
            ) : (
                users.map((email, index) => <Text key={index}>{email}</Text>)
            )}
      {isLoggedIn && <Navbar setScreen={setScreen} />} 
    </View>
  );
};

export default App;
