import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { useCurrency } from '../context/CurrencyContext';
import { useTheme } from '../theme';
import AppText from './AppText';

export default function CurrencyToggleButton({ style }) {
  const { currency, cycleCurrency } = useCurrency();
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <Pressable
      accessibilityLabel="Cambiar moneda de visualización"
      accessibilityRole="button"
      onPress={cycleCurrency}
      style={[styles.button, style]}
    >
      <Ionicons color={theme.colors.textMuted} name="swap-horizontal" size={13} />
      <AppText color="onSurface" variant="labelSm">{currency}</AppText>
    </Pressable>
  );
}

const createStyles = (theme) => StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    minWidth: 44,
    height: 36,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceContainer,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
});
