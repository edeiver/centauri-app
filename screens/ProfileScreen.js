import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText, Button } from '../components';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme';

export default function ProfileScreen({ navigation }) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { logout, user } = useAuth();
  const styles = createStyles(theme);

  const handleLogoutPress = () => {
    Alert.alert(t('profile.logoutConfirmTitle'), t('profile.logoutConfirmBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('profile.logout'), style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel={t('common.close')}
          accessibilityRole="button"
          onPress={navigation.goBack}
          style={styles.iconButton}
        >
          <Ionicons color={theme.colors.onSurface} name="close" size={20} />
        </Pressable>
        <AppText variant="labelMd" weight="semiBold">{t('profile.title')}</AppText>
        <View style={styles.iconButton} />
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <View style={[styles.avatarBubble, { backgroundColor: theme.colors.primaryContainer }]}>
            <Ionicons color={theme.colors.onPrimary} name="person" size={32} />
          </View>

          <AppText variant="headlineSm" weight="semiBold">
            {user?.username || t('profile.title')}
          </AppText>
          {user?.email ? (
            <AppText color="textMuted" variant="bodySm">{user.email}</AppText>
          ) : (
            <AppText color="textMuted" variant="bodySm">{t('profile.noEmail')}</AppText>
          )}

          <View style={styles.divider} />

          <Button
            fullWidth
            leftIcon={<Ionicons color={theme.colors.onError} name="log-out-outline" size={18} />}
            onPress={handleLogoutPress}
            title={t('profile.logout')}
            variant="danger"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme) => StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceContainer,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  card: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceContainer,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
    gap: theme.spacing.xs,
  },
  avatarBubble: {
    width: 72,
    height: 72,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  divider: {
    alignSelf: 'stretch',
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.md,
  },
});
