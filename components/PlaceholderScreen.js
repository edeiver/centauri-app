import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../theme';
import AppText from './AppText';
import Button from './Button';

export default function PlaceholderScreen({
  eyebrow,
  title,
  subtitle,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
}) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        {eyebrow ? (
          <AppText color="accent" style={styles.eyebrow} variant="labelCaps">
            {eyebrow}
          </AppText>
        ) : null}
        <AppText align="center" style={styles.title} variant="headlineLg" weight="bold">
          {title}
        </AppText>
        {subtitle ? (
          <AppText align="center" color="textMuted" variant="bodyMd">
            {subtitle}
          </AppText>
        ) : null}
      </View>

      {actionLabel || secondaryLabel ? (
        <View style={styles.actions}>
          {actionLabel ? <Button fullWidth onPress={onAction} title={actionLabel} /> : null}
          {secondaryLabel ? (
            <Button fullWidth onPress={onSecondary} title={secondaryLabel} variant="ghost" />
          ) : null}
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const createStyles = (theme) => StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.lg,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  eyebrow: {
    marginBottom: theme.spacing.xs,
  },
  title: {
    textAlign: 'center',
  },
  actions: {
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.lg,
  },
});
