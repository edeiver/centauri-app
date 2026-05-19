import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';

import { darkTheme, lightTheme } from './themes';

const ThemeContext = createContext({
  theme: darkTheme,
  mode: 'dark',
  colorScheme: 'dark',
});

export function ThemeProvider({ children }) {
  const colorScheme = useColorScheme();
  const mode = colorScheme === 'light' ? 'light' : 'dark';

  const value = useMemo(
    () => ({
      theme: mode === 'light' ? lightTheme : darkTheme,
      mode,
      colorScheme: colorScheme || 'dark',
    }),
    [colorScheme, mode]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
