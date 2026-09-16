import React from 'react';
import { useFonts } from 'expo-font';
import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import {
  Geist_400Regular,
  Geist_500Medium,
  Geist_600SemiBold,
} from '@expo-google-fonts/geist';

import './i18n';

import { AuthProvider } from './context/AuthContext';
import { BudgetProvider } from './context/BudgetContext';
import { CurrencyProvider } from './context/CurrencyContext';
import AppNavigator from './navigation/AppNavigator';
import { ThemeProvider } from './theme';

export default function App() {
  const [fontsLoaded] = useFonts({
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
    Geist_400Regular,
    Geist_500Medium,
    Geist_600SemiBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <CurrencyProvider>
          <BudgetProvider>
            <AppNavigator />
          </BudgetProvider>
        </CurrencyProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
