import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText, Button, CentauriMark, ThemeToggleButton } from '../components';
import { useTheme } from '../theme';

const FEATURES = [
  {
    icon: 'grid-outline',
    title: 'Vista Vía Láctea',
    description: 'Monitorea tus ingresos, ahorros y gastos estructurados en un solo mapa orbital armonizado.',
  },
  {
    icon: 'alert-circle-outline',
    title: 'Alertas Supernova',
    badge: 'IA ACTIVA',
    description: 'Detección instantánea de consumos atípicos antes de que desestabilicen tu trayectoria mensual.',
  },
  {
    icon: 'radio-outline',
    title: 'Radar de Gastos Hormiga',
    description: 'Ilumina micro-fugas cotidianas enlazadas como constelaciones para que ahorres sin sacrificios.',
  },
];

const ORBIT_DOTS = [
  { color: 'error', top: '8%', left: '18%' },
  { color: 'accent', top: '58%', left: '82%' },
];

export default function WelcomeScreen({ navigation }) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.telemetryRow}>
          <View style={styles.chip}>
            <View style={[styles.dot, { backgroundColor: theme.colors.accent }]} />
            <AppText color="textMuted" variant="labelSm">Telemetría · v3.4</AppText>
          </View>
          <View style={styles.telemetryRight}>
            <AppText color="textMuted" variant="labelSm">Sector: Sol-04</AppText>
            <ThemeToggleButton />
          </View>
        </View>

        <View style={styles.markRow}>
          <CentauriMark />
        </View>

        <View style={styles.brandRow}>
          <AppText variant="headlineMd" weight="bold">Centauri</AppText>
          <View style={styles.brandBadge}>
            <AppText color="accent" variant="labelSm">FINANZAS</AppText>
          </View>
        </View>

        <AppText align="center" variant="displayLg" weight="bold">
          Pon tus finanzas{'\n'}
          <AppText color="primary" variant="displayLg" weight="bold">en órbita</AppText>
        </AppText>

        <AppText align="center" color="textMuted" style={styles.subtitle} variant="bodyLg">
          Controla tu dinero con claridad estelar: presupuestos, predicciones con IA y detección
          inteligente de gastos hormiga sin complicaciones.
        </AppText>

        <View style={styles.orbitCard}>
          <View style={styles.orbitEllipse} />
          <View style={[styles.core, { backgroundColor: theme.colors.surfaceContainerHigh }]}>
            <Ionicons color={theme.colors.accent} name="sunny" size={20} />
          </View>
          {ORBIT_DOTS.map((item) => (
            <View
              key={item.color}
              style={[
                styles.orbitDot,
                { backgroundColor: theme.colors[item.color], top: item.top, left: item.left },
              ]}
            />
          ))}
          <View style={styles.orbitChip}>
            <AppText color="accent" variant="labelSm">Órbita estable</AppText>
          </View>
        </View>

        <View style={styles.features}>
          {FEATURES.map((feature) => (
            <View key={feature.title} style={styles.featureRow}>
              <View style={[styles.featureIcon, { backgroundColor: theme.colors.surfaceContainerHigh }]}>
                <Ionicons color={theme.colors.accent} name={feature.icon} size={18} />
              </View>
              <View style={styles.featureText}>
                <View style={styles.featureTitleRow}>
                  <AppText numberOfLines={1} style={styles.featureTitle} variant="bodyMd" weight="semiBold">
                    {feature.title}
                  </AppText>
                  {feature.badge ? (
                    <View style={[styles.badge, { backgroundColor: theme.colors.errorContainer }]}>
                      <AppText color="error" variant="labelSm">{feature.badge}</AppText>
                    </View>
                  ) : null}
                </View>
                <AppText color="textMuted" variant="bodySm">{feature.description}</AppText>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          fullWidth
          onPress={() => navigation.navigate('SignUp')}
          rightIcon={<Ionicons color={theme.colors.onPrimary} name="arrow-forward" size={18} />}
          title="Empezar ahora"
        />
        <View style={styles.loginRow}>
          <AppText color="textMuted" variant="bodySm">¿Ya tienes cuenta? </AppText>
          <AppText color="accent" onPress={() => navigation.navigate('Login')} variant="bodySm" weight="semiBold">
            Iniciar sesión
          </AppText>
        </View>
        <AppText align="center" color="textMuted" style={styles.secureNote} variant="bodySm">
          Sistema encriptado · Misión privada y segura
        </AppText>
      </View>
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
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
  telemetryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    columnGap: theme.spacing.sm,
    rowGap: theme.spacing.xs,
    paddingTop: theme.spacing.sm,
  },
  telemetryRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  markRow: {
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
  },
  brandBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.surfaceContainerHigh,
  },
  subtitle: {
    marginTop: -theme.spacing.xs,
  },
  orbitCard: {
    height: 180,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.sm,
  },
  orbitEllipse: {
    position: 'absolute',
    width: '80%',
    height: '55%',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  core: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbitDot: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  orbitChip: {
    position: 'absolute',
    bottom: theme.spacing.sm,
    right: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.surfaceContainerHigh,
  },
  features: {
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  featureRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceContainer,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    flex: 1,
    gap: 2,
  },
  featureTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  featureTitle: {
    flexShrink: 1,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.xs,
  },
  footer: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
    gap: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  loginRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  secureNote: {
    marginTop: theme.spacing.xs,
  },
});
