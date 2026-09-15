import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '../theme';
import AppText from './AppText';

export default function Checkbox({ checked, onToggle, label, style }) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      onPress={() => onToggle(!checked)}
      style={[styles.row, style]}
    >
      <View style={[styles.box, checked && styles.boxChecked]}>
        {checked ? <Ionicons color={theme.colors.onPrimary} name="checkmark" size={13} /> : null}
      </View>
      {label ? (
        <AppText color="textMuted" style={styles.label} variant="bodySm">
          {label}
        </AppText>
      ) : null}
    </Pressable>
  );
}

const createStyles = (theme) => StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
  },
  box: {
    width: 20,
    height: 20,
    borderRadius: theme.borderRadius.xs,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  boxChecked: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  label: {
    flex: 1,
  },
});
