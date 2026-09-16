import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as SecureStore from 'expo-secure-store';

import { LANGUAGE_KEY } from '../i18n';
import { useTheme } from '../theme';
import AppText from './AppText';

const LANGUAGES = ['es', 'en'];

export default function LanguageToggleButton({ style }) {
  const { i18n } = useTranslation();
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const cycleLanguage = () => {
    const currentIndex = LANGUAGES.indexOf(i18n.language);
    const nextLanguage = LANGUAGES[(currentIndex + 1) % LANGUAGES.length];
    i18n.changeLanguage(nextLanguage);
    SecureStore.setItemAsync(LANGUAGE_KEY, nextLanguage).catch(() => {});
  };

  return (
    <Pressable
      accessibilityLabel="Change language"
      accessibilityRole="button"
      onPress={cycleLanguage}
      style={[styles.button, style]}
    >
      <AppText color="onSurface" variant="labelSm">{i18n.language.toUpperCase()}</AppText>
    </Pressable>
  );
}

const createStyles = (theme) => StyleSheet.create({
  button: {
    minWidth: 44,
    height: 36,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceContainer,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
});
