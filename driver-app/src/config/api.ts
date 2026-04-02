import { NativeModules, Platform } from 'react-native';

const FORCE_API_HOST = '172.16.0.2';
const USE_ANDROID_EMULATOR = process.env.EXPO_PUBLIC_USE_ANDROID_EMULATOR === '1';
const DEFAULT_LAN_HOST = '172.16.0.2';

function resolveApiHost() {
  if (FORCE_API_HOST.trim()) {
    return FORCE_API_HOST.trim();
  }

  const explicitHost = process.env.EXPO_PUBLIC_API_HOST;
  if (explicitHost && explicitHost.trim()) {
    return explicitHost.trim();
  }

  const serverHostRaw =
    NativeModules?.PlatformConstants?.ServerHost ||
    NativeModules?.DevSettings?.debugServerHost ||
    '';
  const serverHost = String(serverHostRaw).split(':')[0];
  if (serverHost) {
    return serverHost;
  }

  const scriptURL = NativeModules?.SourceCode?.scriptURL || '';
  const matchedHost = scriptURL.match(/^[a-zA-Z]+:\/\/([^/:]+)/)?.[1] || '';

  if (matchedHost) {
    return matchedHost;
  }

  if (Platform.OS === 'android' && USE_ANDROID_EMULATOR) {
    return '10.0.2.2';
  }

  return DEFAULT_LAN_HOST;
}

const API_HOST = resolveApiHost();
console.log('[API_CONFIG] resolved host', { API_HOST });

export const DEV_MOCK_MODE = true;
export const MOCK_DRIVER_ACCOUNT = {
  email: 'driver@fastdeli.com',
  password: '123456',
  token: 'mock-driver-token',
  user: {
    user_id: 9999,
    full_name: 'Tai xe Mock',
    role: 'driver',
    phone_number: '0900000000',
    email: 'driver@fastdeli.com',
  },
} as const;

export const API_CONFIG = {
  authBaseUrl: `http://${API_HOST}:5000`,
  driverBaseUrl: `http://${API_HOST}:5004`,
};

export const STORAGE_KEYS = {
  authToken: 'driver_authToken',
};

