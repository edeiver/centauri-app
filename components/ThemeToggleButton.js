import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { useTheme } from '../theme';

export default function ThemeToggleButton({ style }) {
  const { theme, mode, toggleMode } = useTheme();
  const styles = createStyles(theme);

  return (
    <Pressable
      accessibilityLabel="Cambiar tema claro/oscuro"
      accessibilityRole="button"
      onPress={toggleMode}
      style={[styles.button, style]}
    >
      <Ionicons
        color={theme.colors.onSurface}
        name={mode === 'dark' ? 'sunny-outline' : 'moon-outline'}
        size={18}
      />
    </Pressable>
  );
}

const createStyles = (theme) => StyleSheet.create({
  button: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceContainer,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
});
