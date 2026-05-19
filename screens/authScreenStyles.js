import { StyleSheet } from 'react-native';

export function createAuthScreenStyles(theme) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      //alignItems: 'center',
      //justifyContent: 'center',
      backgroundColor: theme.colors.background,
      paddingHorizontal: theme.spacing.screenPaddingMobile,
    },
    panel: {
      width: '100%',
      maxWidth: 420,
      gap: theme.spacing.md,
      padding: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: theme.colors.surfaceContainerLow,
    },
    eyebrow: {
      fontFamily: 'Roboto_700Bold',
      fontSize: 12,
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      color: theme.colors.textMuted,
    },
    title: {
      fontFamily: 'Roboto_700Bold',
      fontSize: 28,
      lineHeight: 34,
      color: theme.colors.text,
    },
    headText: {
      fontFamily: 'Roboto_400Regular',
      fontSize: 24,
      lineHeight: 28,
      color: theme.colors.textMuted,
      letterSpacing: 2
    },
    subtitle: {
      fontFamily: 'Roboto_400Regular',
      fontSize: 16,
      lineHeight: 24,
      color: theme.colors.textMuted,
    },
    form: {
      gap: theme.spacing.md,
      marginTop: theme.spacing.sm,
    },
    field: {
      gap: theme.spacing.xs,
    },
    label: {
      fontFamily: 'Roboto_500Medium',
      fontSize: 14,
      color: theme.colors.text,
    },
    input: {
      minHeight: 48,
      paddingHorizontal: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: theme.colors.surface,
      color: theme.colors.text,
      fontFamily: 'Roboto_400Regular',
      fontSize: 16,
    },
    error: {
      fontFamily: 'Roboto_400Regular',
      fontSize: 14,
      color: theme.colors.error,
    },
    statusBox: {
      gap: theme.spacing.xs,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: theme.colors.surface,
    },
    statusTitle: {
      fontFamily: 'Roboto_700Bold',
      fontSize: 16,
      color: theme.colors.text,
    },
    statusText: {
      fontFamily: 'Roboto_400Regular',
      fontSize: 14,
      lineHeight: 20,
      color: theme.colors.textMuted,
    },
  });
}
