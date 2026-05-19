import React from 'react';
import { useFonts } from 'expo-font';
import {
  Roboto_400Regular,
  Roboto_500Medium,
  Roboto_700Bold,
  Roboto_300Light,
} from '@expo-google-fonts/roboto';

import { AuthProvider } from './context/AuthContext';
import AppNavigator from './navigation/AppNavigator';
import { ThemeProvider } from './theme';

export default function App() {
  const [fontsLoaded] = useFonts({
    Roboto_400Regular,
    Roboto_500Medium,
    Roboto_700Bold,
    Roboto_300Light,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}
