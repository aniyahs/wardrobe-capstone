// App.tsx
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import Navbar from './src/components/Navbar';
import Login from './src/pages/Login';
import Signup from './src/pages/Signup';
import Gallery from './src/pages/Gallery';
import PhotoUpload from './src/pages/PhotoUpload';
import Profile from './src/pages/Profile';
import Weather from './src/components/Weather';
import { globalStyles } from './src/styles/styles';

const App: React.FC = () => {
  const [screen, setScreen] = useState('Home');

  const renderScreen = () => {
    switch (screen) {
      case 'Login':
        return <Login />;
      case 'Signup':
        return <Signup />;
      case 'Gallery':
        return <Gallery />;
      case 'Upload':
        return <PhotoUpload />;
      case 'Profile':
        return <Profile />;
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
      <Navbar setScreen={setScreen} />
    </View>
  );
};

export default App;
