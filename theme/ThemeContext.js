import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import * as SecureStore from 'expo-secure-store';

import { darkTheme, lightTheme } from './themes';

const THEME_MODE_KEY = 'centauri_theme_mode';

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

  // Restore a persisted manual choice so the theme doesn't reset to the
  // system default on every reload/relaunch.
  useEffect(() => {
    (async () => {
      try {
        const stored = await SecureStore.getItemAsync(THEME_MODE_KEY);

        if (stored === 'light' || stored === 'dark') {
          setOverride(stored);
        }
      } catch {
        // Falls back to the system theme.
      }
    })();
  }, []);

  const toggleMode = useCallback(() => {
    setOverride((current) => {
      const activeMode = current || (systemColorScheme === 'light' ? 'light' : 'dark');
      const next = activeMode === 'light' ? 'dark' : 'light';

      SecureStore.setItemAsync(THEME_MODE_KEY, next).catch(() => {});

      return next;
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
