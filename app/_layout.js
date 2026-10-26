import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { requireOptionalNativeModule } from 'expo';
import { PAPER_THEME_COLORS } from '../constants/theme';
import { AuthProvider } from '../context/AuthContext';

const DevMenuPreferences = typeof requireOptionalNativeModule === 'function'
  ? requireOptionalNativeModule('DevMenuPreferences')
  : null;

// Extend MD3LightTheme with brand colours so all Paper components
// (TextInput, Button, ProgressBar, etc.) use the indigo palette.
const appTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...PAPER_THEME_COLORS,
  },
};

export default function RootLayout() {
  useEffect(() => {
    try {
      if (DevMenuPreferences?.setPreferencesAsync) {
        DevMenuPreferences.setPreferencesAsync({ showFloatingActionButton: false }).catch(() => {});
      }
    } catch (_) {}
  }, []);

  return (
    <SafeAreaProvider>
      <PaperProvider theme={appTheme}>
        <AuthProvider>
          {/*
            Self-closing Stack: Expo Router discovers screens automatically
            from the file system — no need to declare each one explicitly.
          */}
          <Stack screenOptions={{ headerShown: false }} />
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
