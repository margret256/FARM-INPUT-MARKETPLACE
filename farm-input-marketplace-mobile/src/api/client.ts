// api/client.ts
import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getApiUrl = (): string => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) return envUrl;

  try {
    const hostUri = Constants.expoConfig?.hostUri;
    if (hostUri) {
      const host = hostUri.split(':')[0];
      return `http://${host}:3000/api`;
    }
  } catch (error) {
    console.log('Could not get hostUri:', error);
  }

  if (Platform.OS === 'android') return 'http://10.0.2.2:3000/api';
  if (Platform.OS === 'ios') return 'http://localhost:3000/api';
  return 'http://localhost:3000/api';
};

const baseURL = getApiUrl();
console.log('🔧 API URL:', baseURL);

export const apiClient = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export const setAuthToken = (token: string | undefined) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

export default apiClient;