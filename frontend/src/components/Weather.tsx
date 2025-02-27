// src/components/Weather.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { globalStyles } from '../styles/styles';
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
        const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
          params: {
            latitude: 41.5055, // Latitude for Cleveland
            longitude: -81.6813, // Longitude for Cleveland
            current_weather: true, // Get current weather
          },
        });
        setWeatherData(response.data.current_weather);
      } catch (err) {
        setError('Failed to fetch weather data');
      }
    };

    fetchWeather();
  }, []);

  if (error) {
    return <Text style={globalStyles.errorMessage}>{error}</Text>;
  }

  if (!weatherData) {
    return <Text>Loading...</Text>;
  }
  // Convert to Fahrenheit
  const temperature = Math.round((weatherData.temperature * 9) / 5 + 32); 
  
  const conditionCode = weatherData.weathercode;
  const { emoji, description } = getWeatherEmojiAndDescription(conditionCode);

  return (
    <View style={globalStyles.weatherContainer}>
      <Text style={globalStyles.weatherText}>Current Weather in Cleveland:</Text>
      <View style={globalStyles.weatherRow}>
        <Text style={globalStyles.weatherEmoji}>{emoji}</Text>
        <View style={globalStyles.weatherInfo}>
          <Text style={globalStyles.weatherText}>{description}</Text>
          <Text style={globalStyles.weatherText}>{temperature}°F</Text>
        </View>
      </View>
    </View>
  );
};

// Helper function to map weather code to emoji and description
const getWeatherEmojiAndDescription = (code: number) => {
  switch (code) {
    case 0:
      return { emoji: '☀️', description: 'Clear sky' };
    case 1:
      return { emoji: '🌤️', description: 'Mainly clear' };
    case 2:
      return { emoji: '⛅', description: 'Partly cloudy' };
    case 3:
      return { emoji: '☁️', description: 'Overcast' };
    case 45:
      return { emoji: '🌫️', description: 'Fog' };
    case 48:
      return { emoji: '🌫️', description: 'Depositing rime fog' };
    case 51:
      return { emoji: '🌧️', description: 'Light drizzle' };
    case 53:
      return { emoji: '🌧️', description: 'Moderate drizzle' };
    case 55:
      return { emoji: '🌧️', description: 'Heavy drizzle' };
    case 61:
      return { emoji: '🌦️', description: 'Light rain' };
    case 63:
      return { emoji: '🌦️', description: 'Moderate rain' };
    case 65:
      return { emoji: '🌧️', description: 'Heavy rain' };
    case 71:
      return { emoji: '❄️', description: 'Light snow' };
    case 73:
      return { emoji: '❄️', description: 'Moderate snow' };
    case 75:
      return { emoji: '❄️', description: 'Heavy snow' };
    default:
      return { emoji: '❓', description: 'Unknown condition' };
  }
};

export default Weather;
