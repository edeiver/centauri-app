import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText, AppTextInput, Button, CentauriMark, Checkbox, ThemeToggleButton } from '../components';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme';

function getPasswordStrength(password) {
  let score = 0;

  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;

  if (score <= 1) return { label: 'En reposo', pct: password ? 15 : 0, color: 'error' };
  if (score === 2) return { label: 'Estable', pct: 60, color: 'accent' };
  return { label: 'Óptima', pct: 100, color: 'success' };
}

export default function SignUpScreen({ navigation }) {
  const { register, loading } = useAuth();
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');
  const strength = useMemo(() => getPasswordStrength(password), [password]);

  const handleRegister = async () => {
    setError('');

    if (!acceptedTerms) {
      setError('Acepta los términos para continuar.');
      return;
    }

    try {
      await register({ name, email, password });
    } catch (registerError) {
      setError(registerError.message);
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
          <Ionicons color={theme.colors.accent} name="ellipse" size={6} />
          <AppText color="accent" numberOfLines={1} style={styles.chipText} variant="labelSm">
            Registro de misión personal
          </AppText>
        </View>

        <AppText align="center" variant="headlineLg" weight="bold">Empieza tu despegue</AppText>
        <AppText align="center" color="textMuted" style={styles.subtitle} variant="bodyMd">
          Tus cuentas claras y protegidas desde el primer día en la constelación Centauri.
        </AppText>

        <View style={styles.panel}>
          <AppTextInput
            autoCapitalize="words"
            disabled={loading}
            label="Nombre completo"
            labelRight={<AppText color="textMuted" variant="labelSm">Identificador</AppText>}
            leftIcon={<Ionicons color={theme.colors.textMuted} name="person" size={16} />}
            onChangeText={setName}
            placeholder="Valeria Morales"
            value={name}
          />

          <AppTextInput
            autoCapitalize="none"
            disabled={loading}
            keyboardType="email-address"
            label="Correo electrónico"
            labelRight={<AppText color="textMuted" variant="labelSm">Frecuencia segura</AppText>}
            leftIcon={<Ionicons color={theme.colors.textMuted} name="at" size={16} />}
            onChangeText={setEmail}
            placeholder="valeria@universo.io"
            value={email}
          />

          <AppTextInput
            autoCapitalize="none"
            disabled={loading}
            label="Crear contraseña"
            labelRight={<AppText color={strength.color} variant="labelSm">{strength.label}</AppText>}
            leftIcon={<Ionicons color={theme.colors.textMuted} name="key" size={16} />}
            onChangeText={setPassword}
            placeholder="Mínimo 8 caracteres alfanuméricos"
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
              <AppText color="textMuted" variant="labelSm">Fuerza Orbital</AppText>
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
              Combina símbolos estelares, números y mayúsculas.
            </AppText>
          </View>

          <Checkbox
            checked={acceptedTerms}
            label="Acepto los Términos del Servicio y la Política de Privacidad. Mis datos están cifrados de extremo a extremo."
            onToggle={setAcceptedTerms}
          />

          {error ? (
            <AppText color="error" variant="bodySm">{error}</AppText>
          ) : null}

          <Button
            fullWidth
            loading={loading}
            onPress={handleRegister}
            rightIcon={<Ionicons color={theme.colors.onPrimary} name="rocket" size={18} />}
            title="Crear mi universo Centauri"
          />
        </View>

        <View style={styles.footerRow}>
          <Ionicons color={theme.colors.accent} name="shield-checkmark" size={14} />
          <AppText color="textMuted" style={styles.footerText} variant="bodySm">
            Cifrado cuántico de grado financiero 256-bit
          </AppText>
        </View>

        <View style={styles.loginRow}>
          <AppText color="textMuted" variant="bodySm">¿Ya tienes coordenadas en órbita? </AppText>
          <AppText color="accent" onPress={() => navigation.navigate('Login')} variant="bodySm" weight="semiBold">
            Iniciar sesión
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
