import { createContext, useContext } from 'react';
import axios from 'axios';

const ApiContext = createContext();

/// API Provider component that wraps the application
/// and provides access to various APIs.
/// It uses the Context API to share API methods across components.
export const ApiProvider = ({ children }) => {
  // API Keys from environment variables
  const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
  const OPENCAGE_API_KEY = import.meta.env.VITE_OPENCAGE_API_KEY;
  const ORS_API_KEY = import.meta.env.VITE_ORS_API_KEY;

  // WeatherAPI.com methods
  const weatherApi = {
    getForecast: async (lat, lng, days = 3) => {
      try {
        const response = await axios.get('https://api.weatherapi.com/v1/forecast.json', {
          params: {
            key: WEATHER_API_KEY,
            q: `${lat},${lng}`,
            days,
            aqi: 'no',
            alerts: 'no',
            lang: 'ru'
          }
        });
        return {
          current: response.data.current,
          forecast: response.data.forecast,
          location: response.data.location
        };
      } catch (error) {
        console.error('WeatherAPI error:', error);
        throw error;
      }
    },

    // WeatherAPI.com location search
    searchLocations: async (query) => {
      try {
        const response = await axios.get('https://api.weatherapi.com/v1/search.json', {
          params: {
            key: WEATHER_API_KEY,
            q: query
          }
        });
        return response.data;
      } catch (error) {
        console.error('Location search error:', error);
        throw error;
      }
    }
  };

  // OpenCage Geocoding API methods
  const geocodingApi = {
    searchLocations: async (query, limit = 7) => {
      try {
        const response = await axios.get('https://api.opencagedata.com/geocode/v1/json', {
          params: {
            q: query,
            key: OPENCAGE_API_KEY,
            limit,
            no_annotations: 1,
            pretty: 1
          }
        });
        return response.data.results || [];
      } catch (error) {
        console.error('Geocoding error:', error);
        throw error;
      }
    },

    // Reverse geocoding to get place name from coordinates
    getPlaceName: async (lat, lng) => {
      try {
        const response = await axios.get('https://api.opencagedata.com/geocode/v1/json', {
          params: {
            q: `${lat},${lng}`,
            key: OPENCAGE_API_KEY,
            no_annotations: 1,
            pretty: 1
          }
        });
        
        if (response.data.results?.length > 0) {
          return response.data.results[0].formatted || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        }
        return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      } catch (error) {
        console.error('Reverse geocoding error:', error);
        return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      }
    }
  };

  // OpenRouteService API methods
  const routingApi = {
    getRoute: async (coordinates) => {
      try {
        const response = await axios.post(
          'https://api.openrouteservice.org/v2/directions/driving-car/geojson',
          { coordinates },
          {
            headers: {
              Authorization: ORS_API_KEY,
              'Content-Type': 'application/json',
            },
          }
        );
        return response.data;
      } catch (error) {
        console.error('Routing error:', error);
        throw error;
      }
    }
  };

  // Combined API context value
  const api = {
    weather: weatherApi,
    geocoding: geocodingApi,
    routing: routingApi
  };

  return (
    <ApiContext.Provider value={api}>
      {children}
    </ApiContext.Provider>
  );
};

/// Custom hook to use the API context
/// This hook allows components to access the API methods
export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};