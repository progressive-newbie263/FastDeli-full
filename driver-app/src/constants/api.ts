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

// Cấu hình Nhanh - Dành cho lúc thử nghiệm mạng Public (3G/4G)
// set USE_PUBLIC_TUNNEL = `true`, dán đường link tunnel của bạn vào PUBLIC_TUNNEL_URL
// false là dùng local network (wifi), chỉ dùng được khi điện thoại và máy tính cùng kết nối một mạng wifi
const USE_PUBLIC_TUNNEL = true; 
const PUBLIC_TUNNEL_URL = 'https://hvzv22k8-5000.asse.devtunnels.ms';

export const AUTH_API_URL = USE_PUBLIC_TUNNEL 
  ? PUBLIC_TUNNEL_URL 
  : (process.env.EXPO_PUBLIC_AUTH_API_URL || getFallbackUrl());

if (__DEV__) {
  console.log('[API] AUTH_API_URL =', AUTH_API_URL);
}
