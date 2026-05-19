import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useTheme } from '../theme';

export default function LoadingScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.screen}>
      <ActivityIndicator color={theme.colors.primary} size="large" />
    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
  },
});
