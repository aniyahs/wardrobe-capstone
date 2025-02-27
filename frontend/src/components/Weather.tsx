// src/components/Weather.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import axios from 'axios';

interface CurrentWeather {
  temperature: number;
  weathercode: number;
}

const Weather: React.FC = () => {
  const [weatherData, setWeatherData] = useState<CurrentWeather | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await axios.get(
          'https://api.open-meteo.com/v1/forecast',
          {
            params: {
              latitude: 41.5055, // Latitude for Cleveland
              longitude: -81.6813, // Longitude for Cleveland
              current_weather: true, // Get current weather
            },
          }
        );
        setWeatherData(response.data.current_weather);
      } catch (err) {
        setError('Failed to fetch weather data');
      }
    };

    fetchWeather();
  }, []);

  if (error) {
    return <Text style={styles.error}>{error}</Text>;
  }

  if (!weatherData) {
    return <Text>Loading...</Text>;
  }

  const temperature = (weatherData.temperature * 9) / 5 + 32;
  const conditionCode = weatherData.weathercode;
  const condition = getConditionDescription(conditionCode);

  return (
    <View style={styles.weatherContainer}>
      <Text style={styles.weatherText}>Current Weather in Cleveland:</Text>
      <Text style={styles.weatherText}>{condition}</Text>
      <Text style={styles.weatherText}>{temperature}°F</Text>
    </View>
  );
};

// Helper function to convert weather code to description
const getConditionDescription = (code: number): string => {
  switch (code) {
    case 0:
      return 'Clear sky';
    case 1:
      return 'Mainly clear';
    case 2:
      return 'Partly cloudy';
    case 3:
      return 'Overcast';
    case 45:
      return 'Fog';
    case 48:
      return 'Depositing rime fog';
    case 51:
      return 'Light drizzle';
    case 53:
      return 'Moderate drizzle';
    case 55:
      return 'Heavy drizzle';
    case 61:
      return 'Light rain';
    case 63:
      return 'Moderate rain';
    case 65:
      return 'Heavy rain';
    case 71:
      return 'Light snow';
    case 73:
      return 'Moderate snow';
    case 75:
      return 'Heavy snow';
    default:
      return 'Unknown condition';
  }
};

const styles = StyleSheet.create({
  weatherContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  weatherText: {
    fontSize: 18,
    color: '#333',
  },
  error: {
    color: 'red',
    textAlign: 'center',
  },
});

export default Weather;
