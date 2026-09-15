import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';

import { darkTheme, lightTheme } from './themes';

const ThemeContext = createContext({
  theme: darkTheme,
  mode: 'dark',
  colorScheme: 'dark',
  toggleMode: () => {},
});

export function ThemeProvider({ children }) {
  const systemColorScheme = useColorScheme();
  // Manual override lets the user flip themes in-app regardless of the
  // system setting (there is no Settings screen in scope yet to host this).
  const [override, setOverride] = useState(null);
  const mode = override || (systemColorScheme === 'light' ? 'light' : 'dark');

  const toggleMode = useCallback(() => {
    setOverride((current) => {
      const activeMode = current || (systemColorScheme === 'light' ? 'light' : 'dark');
      return activeMode === 'light' ? 'dark' : 'light';
    });
  }, [systemColorScheme]);

  const value = useMemo(
    () => ({
      theme: mode === 'light' ? lightTheme : darkTheme,
      mode,
      colorScheme: mode,
      toggleMode,
    }),
    [mode, toggleMode]
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
