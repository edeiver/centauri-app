import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  AppText,
  AppTextInput,
  Button,
  CentauriMark,
  Checkbox,
  LanguageToggleButton,
  ThemeToggleButton,
} from '../components';
import { useAuth } from '../context/AuthContext';
import { createDevAccessToken } from '../context/devSession';
import { useTheme } from '../theme';

export default function LoginScreen({ navigation }) {
  const { login, setSession } = useAuth();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(theme);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  // Defaults to on so a normal login persists across reloads/relaunches
  // without the user having to remember to opt in; unchecking it keeps the
  // session in-memory only, for shared/public devices.
  const [rememberSession, setRememberSession] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    setError('');
    setSubmitting(true);

    try {
      await login({ username, password, remember: rememberSession });
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <LanguageToggleButton />
          <ThemeToggleButton />
        </View>

        <View style={styles.markRow}>
          <CentauriMark size={64} />
        </View>

        <View style={styles.chip}>
          <View style={[styles.dot, { backgroundColor: theme.colors.accent }]} />
          <AppText color="accent" variant="labelSm">{t('login.orbitSecure')}</AppText>
        </View>

        <AppText align="center" variant="headlineLg" weight="bold">{t('login.brand')}</AppText>
        <AppText align="center" color="accent" variant="labelMd">{t('login.tagline')}</AppText>

        <View style={styles.introBox}>
          <AppText align="center" color="textMuted" variant="bodySm">
            {t('login.welcomeBack')}
          </AppText>
        </View>

        <View style={styles.panel}>
          <AppTextInput
            autoCapitalize="none"
            autoComplete="off"
            autoCorrect={false}
            disabled={submitting}
            keyboardType="default"
            label={t('login.usernameLabel')}
            labelRight={<AppText color="textMuted" variant="labelSm">{t('login.usernameHint')}</AppText>}
            leftIcon={<Ionicons color={theme.colors.textMuted} name="person" size={16} />}
            onChangeText={setUsername}
            placeholder={t('login.usernamePlaceholder')}
            spellCheck={false}
            textContentType="none"
            value={username}
          />

          <AppTextInput
            autoCapitalize="none"
            autoComplete="off"
            autoCorrect={false}
            disabled={submitting}
            keyboardType="default"
            label={t('login.passwordLabel')}
            labelRight={<AppText color="primary" variant="labelSm">{t('login.forgotPassword')}</AppText>}
            leftIcon={<Ionicons color={theme.colors.textMuted} name="lock-closed" size={16} />}
            onChangeText={setPassword}
            placeholder={t('login.passwordPlaceholder')}
            spellCheck={false}
            textContentType="none"
            rightIcon={(
              <Pressable onPress={() => setPasswordVisible((value) => !value)}>
                <Ionicons
                  color={theme.colors.textMuted}
                  name={passwordVisible ? 'eye-off' : 'eye'}
                  size={16}
                />
              </Pressable>
            )}
            secureTextEntry={!passwordVisible}
            value={password}
          />

          <View style={styles.rememberRow}>
            <Checkbox
              checked={rememberSession}
              label={t('login.rememberSession')}
              onToggle={setRememberSession}
              style={styles.rememberCheckbox}
            />
            <View style={styles.encryptedChip}>
              <Ionicons color={theme.colors.accent} name="ellipse" size={6} />
              <AppText color="textMuted" variant="labelSm">{t('login.encrypted')}</AppText>
            </View>
          </View>

          {error ? (
            <AppText color="error" variant="bodySm">{error}</AppText>
          ) : null}

          {submitting ? (
            <AppText color="textMuted" variant="bodySm">
              {t('login.syncing')}
            </AppText>
          ) : null}

          <Button
            fullWidth
            loading={submitting}
            onPress={handleLogin}
            rightIcon={<Ionicons color={theme.colors.onPrimary} name="arrow-forward" size={18} />}
            title={t('login.submit')}
          />

          {__DEV__ ? (
            <Button
              fullWidth
              onPress={() => setSession(createDevAccessToken())}
              title={t('login.devBypass')}
              variant="ghost"
            />
          ) : null}
        </View>

        <View style={styles.statusChip}>
          <Ionicons color={theme.colors.accent} name="ellipse" size={6} />
          <AppText color="textMuted" numberOfLines={1} style={styles.statusText} variant="bodySm">
            {t('login.statusNode')}
          </AppText>
        </View>

        <View style={styles.signUpRow}>
          <AppText color="textMuted" variant="bodySm">{t('login.noAccount')}</AppText>
          <AppText color="accent" onPress={() => navigation.navigate('SignUp')} variant="bodySm" weight="semiBold">
            {t('login.createAccount')}
          </AppText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme) => StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  markRow: {
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  introBox: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surfaceContainer,
    marginTop: theme.spacing.xs,
  },
  panel: {
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceContainer,
    marginTop: theme.spacing.sm,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: theme.spacing.xs,
  },
  rememberCheckbox: {
    flexShrink: 1,
  },
  encryptedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  statusText: {
    flexShrink: 1,
  },
  signUpRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: theme.spacing.xs,
  },
});
