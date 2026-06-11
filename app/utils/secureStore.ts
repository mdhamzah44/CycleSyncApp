import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const isWeb = Platform.OS === 'web';

export const setItem = async (key: string, value: string): Promise<void> => {
  try {
    if (isWeb) {
      localStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  } catch (e) {
    console.warn(`SecureStore setItem failed for key "${key}":`, e);
    throw e;
  }
};

export const getItem = async (key: string): Promise<string | null> => {
  try {
    if (isWeb) {
      const value = localStorage.getItem(key);
      return value && value.length > 0 ? value : null;
    } else {
      const value = await SecureStore.getItemAsync(key);
      return value && value.length > 0 ? value : null;
    }
  } catch (e) {
    console.warn(`SecureStore getItem failed for key "${key}":`, e);
    return null;
  }
};

export const deleteItem = async (key: string): Promise<void> => {
  try {
    if (isWeb) {
      localStorage.removeItem(key);
    } else if (typeof SecureStore.deleteItemAsync === 'function') {
      await SecureStore.deleteItemAsync(key);
    } else {
      await SecureStore.setItemAsync(key, '');
    }
  } catch (e) {
    console.warn(`SecureStore deleteItem failed for key "${key}":`, e);
  }
};