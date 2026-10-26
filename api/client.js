import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import SecureStorageService from '../services/secureStore';

// Determine backend API Base URL dynamically
const getApiBaseUrl = () => {
  const debuggerHost =
    Constants.expoConfig?.hostUri ||
    Constants.manifest2?.extra?.expoGo?.debuggerHost ||
    Constants.manifest?.debuggerHost;
  const devMachineIp = debuggerHost ? debuggerHost.split(':')[0] : null;

  let envUrl = (process.env.EXPO_PUBLIC_API_URL || '').trim().replace(/\/+$/, '');

  // Build base URL from env or auto-detect
  let baseUrl;
  if (envUrl) {
    // Remove any trailing /api so we always have a clean host:port
    baseUrl = envUrl.replace(/\/api\/?$/, '');
  } else if (devMachineIp && devMachineIp !== 'localhost' && devMachineIp !== '127.0.0.1') {
    baseUrl = `http://${devMachineIp}:8000`;
  } else if (Platform.OS === 'android') {
    baseUrl = 'http://10.0.2.2:8000';
  } else {
    baseUrl = 'http://localhost:8000';
  }

  // On Android, localhost/127.0.0.1 won't reach the host machine — rewrite
  if (Platform.OS === 'android' && (baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1'))) {
    if (devMachineIp && devMachineIp !== 'localhost' && devMachineIp !== '127.0.0.1') {
      baseUrl = baseUrl.replace(/localhost|127\.0\.0\.1/, devMachineIp);
    } else {
      baseUrl = baseUrl.replace(/localhost|127\.0\.0\.1/, '10.0.2.2');
    }
  }

  return `${baseUrl}/api`;
};

export const API_BASE_URL = getApiBaseUrl();

// Create an Axios instance
const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

let logoutCallback = null;

export const registerLogoutCallback = (cb) => {
  logoutCallback = cb;
};

// ── Request Interceptor (Attach JWT Access Token & Normalize URL) ───
client.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStorageService.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn('Error reading token from SecureStore:', e);
    }

    // Strip leading slashes from relative paths so axios correctly appends
    // them to baseURL (e.g. '/auth/login/' → 'auth/login/' → baseURL + 'auth/login/')
    // Without this, axios treats '/auth/login/' as absolute and ignores /api in baseURL.
    if (config.url && config.url.startsWith('/') && !config.url.startsWith('http')) {
      config.url = config.url.replace(/^\/+/, '');
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor (Auto Refresh on 401) ─────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 Unauthorized and not already retried
    if (error.response?.status === 401 && !originalRequest?._retry) {
      // Avoid infinite loop if refresh token endpoint itself returns 401
      if (originalRequest.url?.includes('/auth/token/refresh/') || originalRequest.url?.includes('/auth/login/')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return client(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await SecureStorageService.getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Call backend token refresh endpoint
        const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
          refresh: refreshToken,
        });

        const newAccessToken = response.data.access;
        await SecureStorageService.setAccessToken(newAccessToken);

        // Update authorization header and process queue
        client.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        isRefreshing = false;

        return client(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;

        // Token is invalid/expired - clear storage and trigger logout
        await SecureStorageService.clearAll();
        if (logoutCallback) {
          logoutCallback();
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default client;
