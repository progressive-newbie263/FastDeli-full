import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getExpoHost = () => {
  const hostUri = Constants.expoConfig?.hostUri;
  if (!hostUri) {
    return null;
  }

  const [host] = hostUri.split(':');
  return host || null;
};

const getFallbackUrl = () => {
  const expoHost = getExpoHost();
  if (expoHost) {
    return `http://${expoHost}:5000`;
  }

  return Platform.select({
    android: 'http://10.0.2.2:5000',
    default: 'http://localhost:5000',
  });
};

export const AUTH_API_URL = process.env.EXPO_PUBLIC_AUTH_API_URL || getFallbackUrl();

if (__DEV__) {
  console.log('[API] AUTH_API_URL =', AUTH_API_URL);
}
