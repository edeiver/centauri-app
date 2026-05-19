import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React, { useMemo } from 'react';

import LoadingScreen from '../components/LoadingScreen';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme';
import AppStack from './AppStack';
import AuthStack from './AuthStack';

export default function AppNavigator() {
  const { initializing, isAuthenticated } = useAuth();
  const { theme } = useTheme();

  const navigationTheme = useMemo(() => {
    const baseTheme = theme.mode === 'dark' ? DarkTheme : DefaultTheme;

    return {
      ...baseTheme,
      colors: {
        ...baseTheme.colors,
        background: theme.colors.background,
        card: theme.colors.surface,
        primary: theme.colors.primary,
        text: theme.colors.text,
        border: theme.colors.border,
      },
    };
  }, [theme]);

  return (
    <NavigationContainer theme={navigationTheme}>
      {initializing ? <LoadingScreen /> : isAuthenticated ? <AppStack /> : <AuthStack />}
      <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
    </NavigationContainer>
  );
}
