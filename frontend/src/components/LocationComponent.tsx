import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert, StyleSheet } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { PermissionsAndroid } from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

const LocationComponent: React.FC = () => {
  const [location, setLocation] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);

  // Show rationale before requesting permission
  const showRationaleDialog = () => {
    Alert.alert(
      "Location Permission Required",
      "We need access to your location to provide weather information.",
      [
        {
          text: "Cancel",
          onPress: () => setErrorMessage("Permission denied"),
          style: "cancel",
        },
        {
          text: "Continue",
          onPress: () => requestLocationPermission(),
        },
      ]
    );
  };

  // Request location permission
  const requestLocationPermission = async () => {
    try {
      const result = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
      if (result === RESULTS.GRANTED) {
        setPermissionGranted(true);
        getLocation();
      } else if (result === RESULTS.DENIED) {
        setErrorMessage("Permission denied");
      }
    } catch (error) {
      console.warn("Permission request failed:", error);
      setErrorMessage("Failed to request permission");
    }
  };

  // Get current location if permission granted
  const getLocation = () => {
    if (!permissionGranted) {
      setErrorMessage("Location permission not granted");
      return;
    }

    Geolocation.getCurrentPosition(
      (position) => {
        setLocation(
          `Latitude: ${position.coords.latitude}, Longitude: ${position.coords.longitude}`
        );
      },
      (error) => {
        console.log(error.message);
        setErrorMessage("Failed to fetch location");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  // Request permission on component mount
  useEffect(() => {
    check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION)
      .then((result) => {
        if (result === RESULTS.GRANTED) {
          setPermissionGranted(true);
          getLocation();
        } else if (result === RESULTS.DENIED) {
          showRationaleDialog();
        }
      })
      .catch((error) => {
        console.log(error);
        setErrorMessage("Failed to check permission");
      });
  }, []);

  return (
    <View style={styles.container}>
      <Button title="Get Location" onPress={getLocation} />
      {location && <Text style={styles.locationText}>{location}</Text>}
      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationText: {
    marginTop: 20,
    fontSize: 18,
    color: 'black',
  },
  errorText: {
    marginTop: 20,
    fontSize: 18,
    color: 'red',
  },
});

export default LocationComponent;
