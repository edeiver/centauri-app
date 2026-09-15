import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText, AppTextInput, Button, CentauriMark, Checkbox, ThemeToggleButton } from '../components';
import { useAuth } from '../context/AuthContext';
import { createDevAccessToken } from '../context/devSession';
import { useTheme } from '../theme';

export default function LoginScreen({ navigation }) {
  const { login, loading, setSession } = useAuth();
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [rememberSession, setRememberSession] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');

    try {
      await login({ email, password });
    } catch (loginError) {
      setError(loginError.message);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <ThemeToggleButton />
        </View>

        <View style={styles.markRow}>
          <CentauriMark size={64} />
        </View>

        <View style={styles.chip}>
          <View style={[styles.dot, { backgroundColor: theme.colors.accent }]} />
          <AppText color="accent" variant="labelSm">Órbita segura</AppText>
        </View>

        <AppText align="center" variant="headlineLg" weight="bold">Centauri</AppText>
        <AppText align="center" color="accent" variant="labelMd">Tu universo financiero</AppText>

        <View style={styles.introBox}>
          <AppText align="center" color="textMuted" variant="bodySm">
            Hola de nuevo, viajero. Ingresa para sincronizar tus finanzas.
          </AppText>
        </View>

        <View style={styles.panel}>
          <AppTextInput
            autoCapitalize="none"
            disabled={loading}
            keyboardType="email-address"
            label="Correo electrónico"
            labelRight={<AppText color="textMuted" variant="labelSm">Identificador estelar</AppText>}
            leftIcon={<Ionicons color={theme.colors.textMuted} name="at" size={16} />}
            onChangeText={setEmail}
            placeholder="comandante@centauri.space"
            value={email}
          />

          <AppTextInput
            autoCapitalize="none"
            disabled={loading}
            label="Contraseña"
            labelRight={<AppText color="primary" variant="labelSm">¿Olvidaste tu clave?</AppText>}
            leftIcon={<Ionicons color={theme.colors.textMuted} name="lock-closed" size={16} />}
            onChangeText={setPassword}
            placeholder="Ingresa tu contraseña"
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
              label="Recordar sesión"
              onToggle={setRememberSession}
              style={styles.rememberCheckbox}
            />
            <View style={styles.encryptedChip}>
              <Ionicons color={theme.colors.accent} name="ellipse" size={6} />
              <AppText color="textMuted" variant="labelSm">Encriptado 256-bit</AppText>
            </View>
          </View>

          {error ? (
            <AppText color="error" variant="bodySm">{error}</AppText>
          ) : null}

          <Button
            fullWidth
            loading={loading}
            onPress={handleLogin}
            rightIcon={<Ionicons color={theme.colors.onPrimary} name="arrow-forward" size={18} />}
            title="Iniciar sesión"
          />

          {__DEV__ ? (
            <Button
              fullWidth
              onPress={() => setSession(createDevAccessToken())}
              title="[DEV] Entrar sin backend"
              variant="ghost"
            />
          ) : null}
        </View>

        <View style={styles.statusChip}>
          <Ionicons color={theme.colors.accent} name="ellipse" size={6} />
          <AppText color="textMuted" numberOfLines={1} style={styles.statusText} variant="bodySm">
            Nodo Alfa Centauri sincronizado y seguro
          </AppText>
        </View>

        <View style={styles.signUpRow}>
          <AppText color="textMuted" variant="bodySm">¿Nuevo en Centauri? </AppText>
          <AppText color="accent" onPress={() => navigation.navigate('SignUp')} variant="bodySm" weight="semiBold">
            Crear cuenta
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
