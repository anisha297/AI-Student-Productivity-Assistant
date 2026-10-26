import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import client, { registerLogoutCallback } from '../api/client';
import SecureStorageService from '../services/secureStore';
import { router } from 'expo-router';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [tokens, setTokens] = useState({ access: null, refresh: null });
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // ── Logout Handler ──────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      const refreshToken = await SecureStorageService.getRefreshToken();
      if (refreshToken) {
        // Attempt backend blacklist
        await client.post('/auth/logout/', { refresh: refreshToken }).catch(() => {});
      }
    } catch (e) {
      console.warn('Logout error:', e);
    } finally {
      await SecureStorageService.clearAll();
      setUser(null);
      setTokens({ access: null, refresh: null });
      router.replace('/login');
    }
  }, []);

  // Register logout callback with axios client for expired refresh tokens
  useEffect(() => {
    registerLogoutCallback(logout);
  }, [logout]);

  // ── Restore User Session on Startup ─────────────────────────
  const checkAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      const [accessToken, refreshToken, savedUser] = await Promise.all([
        SecureStorageService.getAccessToken(),
        SecureStorageService.getRefreshToken(),
        SecureStorageService.getUserData(),
      ]);

      if (accessToken && savedUser) {
        setUser(savedUser);
        setTokens({ access: accessToken, refresh: refreshToken });

        // Refresh profile in background
        try {
          const res = await client.get('/auth/me/');
          if (res.data?.user) {
            setUser(res.data.user);
            await SecureStorageService.setUserData(res.data.user);
          }
        } catch (apiErr) {
          // If offline or network error, keep offline savedUser
          console.log('Session verification error:', apiErr?.message);
        }
      } else {
        setUser(null);
        setTokens({ access: null, refresh: null });
      }
    } catch (error) {
      console.warn('Failed to restore auth session:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // ── Login with Email & Password ─────────────────────────────
  const login = async (email, password) => {
    setAuthError(null);
    try {
      const response = await client.post('/auth/login/', {
        email: email.trim().toLowerCase(),
        password,
      });

      const { user: userData, tokens: tokenData } = response.data;

      await SecureStorageService.setAccessToken(tokenData.access);
      await SecureStorageService.setRefreshToken(tokenData.refresh);
      await SecureStorageService.setUserData(userData);

      setUser(userData);
      setTokens(tokenData);

      return { success: true, user: userData };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.errors?.non_field_errors?.[0] ||
        error.response?.data?.errors?.email?.[0] ||
        error.response?.data?.errors?.password?.[0] ||
        'Unable to log in. Please check your credentials.';
      setAuthError(message);
      return { success: false, error: message };
    }
  };

  // ── User Registration ───────────────────────────────────────
  const register = async (registrationData) => {
    setAuthError(null);
    try {
      const response = await client.post('/auth/register/', {
        ...registrationData,
        email: registrationData.email?.trim().toLowerCase(),
      });

      const { user: userData, tokens: tokenData } = response.data;

      await SecureStorageService.setAccessToken(tokenData.access);
      await SecureStorageService.setRefreshToken(tokenData.refresh);
      await SecureStorageService.setUserData(userData);

      setUser(userData);
      setTokens(tokenData);

      return { success: true, user: userData };
    } catch (error) {
      const fieldErrors = error.response?.data?.errors || {};
      const firstKey = Object.keys(fieldErrors)[0];
      const message =
        fieldErrors[firstKey]?.[0] ||
        error.response?.data?.message ||
        'Registration failed. Please check the entered details.';
      setAuthError(message);
      return { success: false, error: message, errors: fieldErrors };
    }
  };

  // ── Google OAuth Sign-In ────────────────────────────────────
  const googleLogin = async (googlePayload) => {
    setAuthError(null);
    try {
      const response = await client.post('/auth/google/', googlePayload);
      const { user: userData, tokens: tokenData } = response.data;

      await SecureStorageService.setAccessToken(tokenData.access);
      await SecureStorageService.setRefreshToken(tokenData.refresh);
      await SecureStorageService.setUserData(userData);

      setUser(userData);
      setTokens(tokenData);

      return { success: true, user: userData };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.errors?.non_field_errors?.[0] ||
        'Google Sign-In failed. Please try again.';
      setAuthError(message);
      return { success: false, error: message };
    }
  };

  // ── Update Profile ──────────────────────────────────────────
  const updateProfile = async (profileData) => {
    try {
      // Clean payload: omit avatar_url if blank so URLField validation doesn't reject it
      const payload = { ...profileData };
      if (!payload.avatar_url || !payload.avatar_url.trim()) {
        delete payload.avatar_url;
      }

      const response = await client.patch('/auth/profile/', payload);
      const updatedUser = response.data.user;

      await SecureStorageService.setUserData(updatedUser);
      setUser(updatedUser);

      return { success: true, user: updatedUser, message: response.data.message };
    } catch (error) {
      // Extract specific field errors from backend response if available
      const fieldErrors = error.response?.data?.errors;
      let detailedMsg = null;
      if (fieldErrors && typeof fieldErrors === 'object') {
        const keys = Object.keys(fieldErrors);
        if (keys.length > 0) {
          const firstKey = keys[0];
          const errVal = fieldErrors[firstKey];
          const errText = Array.isArray(errVal) ? errVal[0] : String(errVal);
          detailedMsg = `${firstKey.replace('_', ' ')}: ${errText}`;
        }
      }

      // If backend is offline or unreachable, update locally so user profile persists
      if (!error.response || error.code === 'ECONNABORTED' || error.message?.includes('Network Error')) {
        const fallbackUser = {
          ...user,
          full_name: profileData.full_name || user?.full_name,
          profile: {
            ...(user?.profile || {}),
            ...profileData,
          },
        };
        await SecureStorageService.setUserData(fallbackUser);
        setUser(fallbackUser);
        return { success: true, user: fallbackUser, offline: true };
      }

      const message =
        detailedMsg ||
        error.response?.data?.message ||
        'Failed to update profile. Please verify your details.';
      return { success: false, error: message };
    }
  };

  // ── Change Password ─────────────────────────────────────────
  const changePassword = async (oldPassword, newPassword, confirmPassword) => {
    try {
      const response = await client.post('/auth/change-password/', {
        old_password: oldPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      return { success: true, message: response.data.message };
    } catch (error) {
      const errors = error.response?.data?.errors || {};
      const message =
        errors.old_password?.[0] ||
        errors.confirm_password?.[0] ||
        errors.new_password?.[0] ||
        error.response?.data?.message ||
        'Failed to change password.';
      return { success: false, error: message, errors };
    }
  };

  // ── Forgot Password ─────────────────────────────────────────
  const forgotPassword = async (email) => {
    try {
      const response = await client.post('/auth/forgot-password/', {
        email: email.trim().toLowerCase(),
      });
      return {
        success: true,
        message: response.data.message,
        code: response.data.code, // in case needed for demo
        email: response.data.email,
      };
    } catch (error) {
      const errors = error.response?.data?.errors || {};
      const message =
        errors.email?.[0] ||
        error.response?.data?.message ||
        'Failed to send reset code.';
      return { success: false, error: message };
    }
  };

  // ── Reset Password ──────────────────────────────────────────
  const resetPassword = async (email, code, newPassword, confirmPassword) => {
    try {
      const response = await client.post('/auth/reset-password/', {
        email: email.trim().toLowerCase(),
        code: code.trim(),
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      return { success: true, message: response.data.message };
    } catch (error) {
      const errors = error.response?.data?.errors || {};
      const message =
        errors.code?.[0] ||
        errors.confirm_password?.[0] ||
        errors.new_password?.[0] ||
        errors.email?.[0] ||
        error.response?.data?.message ||
        'Failed to reset password.';
      return { success: false, error: message, errors };
    }
  };

  const value = {
    user,
    tokens,
    isLoading,
    isAuthenticated: !!user && !!tokens?.access,
    authError,
    setAuthError,
    login,
    register,
    googleLogin,
    logout,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
