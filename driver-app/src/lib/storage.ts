import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../config/api';

export async function setAuthToken(token: string) {
  await AsyncStorage.setItem(STORAGE_KEYS.authToken, token);
}

export async function getAuthToken(): Promise<string | null> {
  return AsyncStorage.getItem(STORAGE_KEYS.authToken);
}

export async function clearAuthToken() {
  await AsyncStorage.removeItem(STORAGE_KEYS.authToken);
}

