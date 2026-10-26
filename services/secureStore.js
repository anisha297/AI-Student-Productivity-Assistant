import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const ACCESS_TOKEN_KEY = 'auth_access_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';
const USER_DATA_KEY = 'auth_user_data';

// Web memory fallback for web preview compatibility
let memoryStorage = {};

const isWeb = Platform.OS === 'web';

export const SecureStorageService = {
  async setItem(key, value) {
    try {
      if (isWeb) {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(key, value);
        } else {
          memoryStorage[key] = value;
        }
      } else {
        await SecureStore.setItemAsync(key, value);
      }
    } catch (error) {
      console.warn(`SecureStorage setItem failed for ${key}:`, error);
    }
  },

  async getItem(key) {
    try {
      if (isWeb) {
        if (typeof window !== 'undefined' && window.localStorage) {
          return window.localStorage.getItem(key);
        }
        return memoryStorage[key] || null;
      }
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.warn(`SecureStorage getItem failed for ${key}:`, error);
      return null;
    }
  },

  async deleteItem(key) {
    try {
      if (isWeb) {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(key);
        }
        delete memoryStorage[key];
      } else {
        await SecureStore.deleteItemAsync(key);
      }
    } catch (error) {
      console.warn(`SecureStorage deleteItem failed for ${key}:`, error);
    }
  },

  // Token & User helpers
  async setAccessToken(token) {
    if (token) {
      await this.setItem(ACCESS_TOKEN_KEY, token);
    } else {
      await this.deleteItem(ACCESS_TOKEN_KEY);
    }
  },

  async getAccessToken() {
    return await this.getItem(ACCESS_TOKEN_KEY);
  },

  async setRefreshToken(token) {
    if (token) {
      await this.setItem(REFRESH_TOKEN_KEY, token);
    } else {
      await this.deleteItem(REFRESH_TOKEN_KEY);
    }
  },

  async getRefreshToken() {
    return await this.getItem(REFRESH_TOKEN_KEY);
  },

  async setUserData(user) {
    if (user) {
      await this.setItem(USER_DATA_KEY, JSON.stringify(user));
    } else {
      await this.deleteItem(USER_DATA_KEY);
    }
  },

  async getUserData() {
    const raw = await this.getItem(USER_DATA_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  },

  async clearAll() {
    await this.deleteItem(ACCESS_TOKEN_KEY);
    await this.deleteItem(REFRESH_TOKEN_KEY);
    await this.deleteItem(USER_DATA_KEY);
  }
};

export default SecureStorageService;
