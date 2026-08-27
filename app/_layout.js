import { Stack } from 'expo-router';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PAPER_THEME_COLORS } from '../constants/theme';

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
  return (
    <SafeAreaProvider>
      <PaperProvider theme={appTheme}>
        {/*
          Self-closing Stack: Expo Router discovers screens automatically
          from the file system — no need to declare each one explicitly.
        */}
        <Stack screenOptions={{ headerShown: false }} />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
