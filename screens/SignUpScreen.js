import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useMemo, useState } from 'react';
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
import { useTheme } from '../theme';

// Mirrors centauri-ai-backend's auth.controller.js validateRegisterPayload.
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,30}$/;

function getPasswordStrength(password, t) {
  let score = 0;

  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;

  if (score <= 1) return { label: t('signup.strengthRest'), pct: password ? 15 : 0, color: 'error' };
  if (score === 2) return { label: t('signup.strengthStable'), pct: 60, color: 'accent' };
  return { label: t('signup.strengthOptimal'), pct: 100, color: 'success' };
}

export default function SignUpScreen({ navigation }) {
  const { register } = useAuth();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(theme);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const strength = useMemo(() => getPasswordStrength(password, t), [password, t]);

  const handleRegister = async () => {
    setError('');

    if (!USERNAME_REGEX.test(username)) {
      setError(t('signup.errorUsername'));
      return;
    }

    if (!acceptedTerms) {
      setError(t('signup.errorTerms'));
      return;
    }

    setSubmitting(true);

    try {
      await register({ username, email, password });
    } catch (registerError) {
      setError(registerError.message);
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
          <Ionicons color={theme.colors.accent} name="ellipse" size={6} />
          <AppText color="accent" numberOfLines={1} style={styles.chipText} variant="labelSm">
            {t('signup.missionRegistration')}
          </AppText>
        </View>

        <AppText align="center" variant="headlineLg" weight="bold">{t('signup.title')}</AppText>
        <AppText align="center" color="textMuted" style={styles.subtitle} variant="bodyMd">
          {t('signup.subtitle')}
        </AppText>

        <View style={styles.panel}>
          <AppTextInput
            autoCapitalize="none"
            autoComplete="off"
            autoCorrect={false}
            disabled={submitting}
            helperText={t('signup.usernameHelper')}
            keyboardType="default"
            label={t('signup.usernameLabel')}
            labelRight={<AppText color="textMuted" variant="labelSm">{t('signup.usernameHint')}</AppText>}
            leftIcon={<Ionicons color={theme.colors.textMuted} name="person" size={16} />}
            onChangeText={setUsername}
            placeholder={t('signup.usernamePlaceholder')}
            spellCheck={false}
            textContentType="none"
            value={username}
          />

          <AppTextInput
            autoCapitalize="none"
            autoComplete="off"
            autoCorrect={false}
            disabled={submitting}
            keyboardType="email-address"
            label={t('signup.emailLabel')}
            labelRight={<AppText color="textMuted" variant="labelSm">{t('signup.emailHint')}</AppText>}
            leftIcon={<Ionicons color={theme.colors.textMuted} name="at" size={16} />}
            onChangeText={setEmail}
            placeholder={t('signup.emailPlaceholder')}
            spellCheck={false}
            textContentType="none"
            value={email}
          />

          <AppTextInput
            autoCapitalize="none"
            autoComplete="off"
            autoCorrect={false}
            disabled={submitting}
            keyboardType="default"
            label={t('signup.passwordLabel')}
            labelRight={<AppText color={strength.color} variant="labelSm">{strength.label}</AppText>}
            leftIcon={<Ionicons color={theme.colors.textMuted} name="key" size={16} />}
            onChangeText={setPassword}
            placeholder={t('signup.passwordPlaceholder')}
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

          <View style={styles.strengthBox}>
            <View style={styles.strengthHeaderRow}>
              <AppText color="textMuted" variant="labelSm">{t('signup.strengthTitle')}</AppText>
              <AppText color={strength.color} variant="labelSm">{strength.pct}%</AppText>
            </View>
            <View style={styles.strengthTrack}>
              <View
                style={[
                  styles.strengthFill,
                  { width: `${strength.pct}%`, backgroundColor: theme.colors[strength.color] },
                ]}
              />
            </View>
            <AppText color="textMuted" variant="bodySm">
              {t('signup.strengthHint')}
            </AppText>
          </View>

          <Checkbox
            checked={acceptedTerms}
            label={t('signup.terms')}
            onToggle={setAcceptedTerms}
          />

          {error ? (
            <AppText color="error" variant="bodySm">{error}</AppText>
          ) : null}

          {submitting ? (
            <AppText color="textMuted" variant="bodySm">
              {t('signup.creating')}
            </AppText>
          ) : null}

          <Button
            fullWidth
            loading={submitting}
            onPress={handleRegister}
            rightIcon={<Ionicons color={theme.colors.onPrimary} name="rocket" size={18} />}
            title={t('signup.submit')}
          />
        </View>

        <View style={styles.footerRow}>
          <Ionicons color={theme.colors.accent} name="shield-checkmark" size={14} />
          <AppText color="textMuted" style={styles.footerText} variant="bodySm">
            {t('signup.encryptedFooter')}
          </AppText>
        </View>

        <View style={styles.loginRow}>
          <AppText color="textMuted" variant="bodySm">{t('signup.haveAccount')}</AppText>
          <AppText color="accent" onPress={() => navigation.navigate('Login')} variant="bodySm" weight="semiBold">
            {t('signup.login')}
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
    paddingHorizontal: theme.spacing.md,
  },
  chipText: {
    flexShrink: 1,
  },
  subtitle: {
    marginTop: -theme.spacing.xs,
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
  strengthBox: {
    gap: theme.spacing.xs,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surfaceContainerHigh,
  },
  strengthHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  strengthTrack: {
    height: 4,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surfaceContainerHighest,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  footerText: {
    flexShrink: 1,
    textAlign: 'center',
  },
  loginRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: theme.spacing.xs,
  },
});
