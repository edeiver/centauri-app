import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText, Button, ThemeToggleButton } from '../components';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme';

// Mirrors the shape expected from GET /transactions + GET /ai/insights.
// Wiring to the real endpoints is pending confirmation of their exact
// response fields (see open question raised alongside this screen).
const BALANCE = {
  available: 28450.0,
  currency: 'MXN',
  reservePct: 68,
  spendPct: 32,
  income: 42000.0,
  incomeSources: 2,
  expenses: 13550.0,
  expensesTrendPct: -8,
};

const PLANETS = [
  { id: 'hogar', label: 'Hogar', amount: 6500, icon: 'home', color: 'accentAlt', angle: -55 },
  { id: 'super', label: 'Súper', amount: 3200, icon: 'restaurant', color: 'error', angle: 35 },
  { id: 'ocio', label: 'Ocio', amount: 1600, icon: 'film', color: 'onSurfaceVariant', angle: -160 },
  { id: 'movilidad', label: 'Movilidad', amount: 1450, icon: 'car', color: 'accent', angle: 150 },
];

const CATEGORIES = [
  {
    id: 'hogar',
    icon: 'home',
    color: 'accentAlt',
    title: 'Planeta Hogar & Renta',
    subtitle: '47.9% de los egresos · Masa estable',
    amount: 6500.0,
    status: 'Fijo mensual',
  },
  {
    id: 'nutricion',
    icon: 'restaurant',
    color: 'error',
    title: 'Planeta Nutrición & Súper',
    subtitle: '23.6% de los egresos · 8 consumos',
    amount: 3200.0,
    status: 'En presupuesto',
  },
  {
    id: 'ocio',
    icon: 'film',
    color: 'onSurfaceVariant',
    title: 'Planeta Ocio & Streaming',
    subtitle: '11.8% de los egresos · Sin fricción',
    amount: 1600.0,
    status: 'Dentro del límite',
  },
  {
    id: 'movilidad',
    icon: 'car',
    color: 'accent',
    title: 'Planeta Movilidad',
    subtitle: '10.7% de los egresos · Metro + App',
    amount: 1450.0,
    status: 'Trayecto seguro',
  },
  {
    id: 'hormiga',
    icon: 'sparkles',
    color: 'error',
    title: 'Constelación Hormiga',
    badge: 'MICROS',
    subtitle: '5.9% de egresos · Cafés, tips y snacks',
    amount: 800.0,
    status: 'Bajo observación',
    highlighted: true,
  },
];

const AI_INSIGHT = {
  headline: 'Vas 12% mejor que el mes pasado en gastos fijos.',
  body: 'Tu órbita de vivienda y servicios consumió menos energía financiera. Si mantienes esta trayectoria, acumularás $3,400 adicionales para tu próximo salto de inversión.',
};

const TODAY_TRANSACTIONS = [
  {
    id: 't1',
    icon: 'cart',
    title: 'Mercado Gourmet Roma',
    subtitle: 'Planeta Nutrición · 19:42 hrs',
    amount: -620.0,
    method: 'Tarjeta Física',
  },
  {
    id: 't2',
    icon: 'cafe',
    title: 'Flat White · Café Estelar',
    subtitle: 'Constelación Hormiga · 15:10 hrs',
    amount: -75.0,
    method: 'Apple Pay',
  },
  {
    id: 't3',
    icon: 'car',
    title: 'Tarjeta de Movilidad Integral',
    subtitle: 'Planeta Movilidad · 08:30 hrs',
    amount: -150.0,
    method: 'Transferencia',
  },
];

function formatCurrency(value) {
  const sign = value < 0 ? '-' : '';
  return `${sign}$${Math.abs(value).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function DashboardScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const styles = createStyles(theme);
  const firstName = user?.name?.split(' ')[0] || 'Comandante';

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <Ionicons color={theme.colors.accent} name="planet-outline" size={18} />
            <AppText color="textMuted" variant="labelMd">CENTAURI</AppText>
            <AppText color="textMuted" variant="labelMd">/</AppText>
            <AppText variant="labelMd" weight="semiBold">Dashboard</AppText>
          </View>
          <View style={styles.headerActions}>
            <ThemeToggleButton />
            <View style={styles.iconButton}>
              <Ionicons color={theme.colors.onSurface} name="notifications-outline" size={18} />
            </View>
            <View style={[styles.avatar, { backgroundColor: theme.colors.primaryContainer }]}>
              <Ionicons color={theme.colors.onPrimary} name="person" size={18} />
            </View>
          </View>
        </View>

        <View style={styles.greetingCard}>
          <View style={styles.greetingText}>
            <View style={styles.chip}>
              <View style={[styles.dot, { backgroundColor: theme.colors.accent }]} />
              <AppText color="accent" variant="labelSm">Órbita Ciclo 09 · En Trayectoria</AppText>
            </View>
            <AppText style={styles.greetingTitle} variant="headlineLg" weight="bold">
              Buenas noches, {firstName}
            </AppText>
            <AppText color="textMuted" variant="bodySm">
              Atmósfera financiera en equilibrio sereno
            </AppText>
          </View>
          <View style={[styles.greetingAvatar, { backgroundColor: theme.colors.surfaceContainerHigh }]}>
            <Ionicons color={theme.colors.accent} name="planet" size={26} />
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardHeaderLabel}>
              <Ionicons color={theme.colors.accent} name="infinite" size={16} />
              <AppText color="textMuted" style={styles.cardHeaderLabelText} variant="labelMd">
                Cúmulo Estelar · Capital Disponible
              </AppText>
            </View>
            <View style={styles.periodChip}>
              <AppText color="onSurfaceVariant" variant="labelSm">OCT 2024</AppText>
            </View>
          </View>

          <View style={styles.balanceRow}>
            <AppText variant="numericHero" weight="bold">
              {formatCurrency(BALANCE.available)}
            </AppText>
            <AppText color="textMuted" style={styles.balanceUnit} variant="bodyMd">
              {BALANCE.currency}
            </AppText>
          </View>
          <View style={styles.balanceSubtitleRow}>
            <View style={[styles.dot, { backgroundColor: theme.colors.accent }]} />
            <AppText color="textMuted" variant="bodySm">
              {BALANCE.reservePct}% de tu masa monetaria preservada este ciclo
            </AppText>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressSegment,
                { backgroundColor: theme.colors.accent, flex: BALANCE.reservePct },
              ]}
            />
            <View
              style={[
                styles.progressSegment,
                { backgroundColor: theme.colors.error, flex: BALANCE.spendPct },
              ]}
            />
          </View>
          <View style={styles.progressLabelsRow}>
            <AppText color="accent" variant="bodySm">
              Reserva protegida: {BALANCE.reservePct}%
            </AppText>
            <AppText color="error" variant="bodySm">
              Gasto: {BALANCE.spendPct}%
            </AppText>
          </View>

          <View style={styles.divider} />

          <View style={styles.statsRow}>
            <View style={styles.statColumn}>
              <View style={styles.statLabelRow}>
                <Ionicons color={theme.colors.accent} name="arrow-down" size={14} />
                <AppText color="textMuted" variant="labelSm">Ingresos Órbita</AppText>
              </View>
              <AppText variant="titleMd" weight="semiBold">
                {formatCurrency(BALANCE.income)}
              </AppText>
              <AppText color="textMuted" variant="bodySm">
                {BALANCE.incomeSources} fuentes activas
              </AppText>
            </View>
            <View style={styles.statColumn}>
              <View style={styles.statLabelRow}>
                <Ionicons color={theme.colors.error} name="arrow-up" size={14} />
                <AppText color="textMuted" variant="labelSm">Gastos Totales</AppText>
              </View>
              <AppText variant="titleMd" weight="semiBold">
                {formatCurrency(BALANCE.expenses)}
              </AppText>
              <AppText color="textMuted" variant="bodySm">
                Ritmo óptimo ({BALANCE.expensesTrendPct}%)
              </AppText>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionHeaderText}>
            <AppText variant="headlineSm" weight="semiBold">Sistema Planetario de Gastos</AppText>
            <AppText color="textMuted" variant="bodySm">
              Dimensiones y gravedad de consumo del ciclo
            </AppText>
          </View>
          <AppText color="accent" variant="labelSm">MAPA</AppText>
        </View>

        <View style={styles.orbitCard}>
          <View style={styles.orbitRing} />
          <View style={styles.orbitRingInner} />
          <View style={[styles.core, { backgroundColor: theme.colors.surfaceContainerHigh }]}>
            <Ionicons color={theme.colors.accent} name="sunny" size={18} />
          </View>
          {PLANETS.map((planet) => {
            const radius = 88;
            const rad = (planet.angle * Math.PI) / 180;
            const x = Math.cos(rad) * radius;
            const y = Math.sin(rad) * radius;

            return (
              <View
                key={planet.id}
                style={[
                  styles.planetNode,
                  { transform: [{ translateX: x }, { translateY: y }] },
                ]}
              >
                <View
                  style={[
                    styles.planetDot,
                    { backgroundColor: theme.colors.surfaceContainerHigh, borderColor: theme.colors[planet.color] },
                  ]}
                >
                  <Ionicons color={theme.colors[planet.color]} name={planet.icon} size={14} />
                </View>
                <AppText color="textMuted" variant="bodySm">
                  {planet.label} {formatCurrency(planet.amount).replace('.00', 'k').replace('$', '$')}
                </AppText>
              </View>
            );
          })}
        </View>

        <View style={styles.list}>
          {CATEGORIES.map((category) => (
            <View
              key={category.id}
              style={[
                styles.categoryRow,
                category.highlighted && {
                  borderColor: theme.colors.error,
                  backgroundColor: theme.colors.errorContainer,
                },
              ]}
            >
              <View
                style={[
                  styles.categoryIcon,
                  { backgroundColor: theme.colors.surfaceContainerHigh, borderColor: theme.colors[category.color] },
                ]}
              >
                <Ionicons color={theme.colors[category.color]} name={category.icon} size={18} />
              </View>
              <View style={styles.categoryText}>
                <View style={styles.categoryTitleRow}>
                  <AppText numberOfLines={1} style={styles.categoryTitle} variant="bodyMd" weight="semiBold">
                    {category.title}
                  </AppText>
                  {category.badge ? (
                    <View style={[styles.badge, { backgroundColor: theme.colors.error }]}>
                      <AppText color="onError" variant="labelSm">{category.badge}</AppText>
                    </View>
                  ) : null}
                </View>
                <AppText color="textMuted" variant="bodySm">{category.subtitle}</AppText>
              </View>
              <View style={styles.categoryAmountColumn}>
                <AppText variant="bodyMd" weight="semiBold">{formatCurrency(category.amount)}</AppText>
                <AppText color="accent" variant="bodySm">{category.status}</AppText>
              </View>
            </View>
          ))}
        </View>

        <View style={[styles.aiCard, { borderColor: theme.colors.accent }]}>
          <View style={[styles.aiIconBubble, { backgroundColor: theme.colors.surfaceContainerHigh }]}>
            <Ionicons color={theme.colors.accent} name="bulb-outline" size={18} />
          </View>
          <View style={styles.aiText}>
            <View style={styles.chip}>
              <View style={[styles.dot, { backgroundColor: theme.colors.accent }]} />
              <AppText color="accent" variant="labelSm">Alerta Proactiva Centauri IA</AppText>
            </View>
            <AppText style={styles.aiHeadline} variant="bodyMd" weight="semiBold">
              {AI_INSIGHT.headline}
            </AppText>
            <AppText color="textMuted" variant="bodySm">{AI_INSIGHT.body}</AppText>
          </View>
        </View>

        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionHeaderText}>
            <AppText variant="headlineSm" weight="semiBold">Telemetría de Hoy</AppText>
            <AppText color="textMuted" variant="bodySm">
              Eventos registrados en las últimas 12 horas
            </AppText>
          </View>
          <View style={styles.periodChip}>
            <AppText color="onSurfaceVariant" variant="labelSm">{TODAY_TRANSACTIONS.length} EVENTOS</AppText>
          </View>
        </View>

        <View style={styles.list}>
          {TODAY_TRANSACTIONS.map((transaction) => (
            <View key={transaction.id} style={styles.transactionRow}>
              <View style={[styles.categoryIcon, { backgroundColor: theme.colors.surfaceContainerHigh, borderColor: theme.colors.border }]}>
                <Ionicons color={theme.colors.onSurfaceVariant} name={transaction.icon} size={18} />
              </View>
              <View style={styles.categoryText}>
                <AppText numberOfLines={1} variant="bodyMd" weight="semiBold">{transaction.title}</AppText>
                <AppText color="textMuted" variant="bodySm">{transaction.subtitle}</AppText>
              </View>
              <View style={styles.categoryAmountColumn}>
                <AppText color={transaction.amount < 0 ? 'error' : 'accent'} variant="bodyMd" weight="semiBold">
                  {formatCurrency(transaction.amount)}
                </AppText>
                <AppText color="textMuted" variant="bodySm">{transaction.method}</AppText>
              </View>
            </View>
          ))}
        </View>

        <Button
          fullWidth
          leftIcon={<Ionicons color={theme.colors.accent} name="add-circle-outline" size={18} />}
          style={styles.ctaButton}
          title="Registrar nuevo impulso orbital"
          variant="outline"
        />
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
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing['2xl'],
    gap: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: theme.spacing.sm,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
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
  avatar: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greetingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  greetingText: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  greetingTitle: {
    marginTop: theme.spacing.xs,
  },
  greetingAvatar: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
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
  card: {
    backgroundColor: theme.colors.surfaceContainer,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: theme.spacing.xs,
  },
  cardHeaderLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    gap: theme.spacing.xs,
  },
  cardHeaderLabelText: {
    flexShrink: 1,
  },
  periodChip: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.surfaceContainerHigh,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: theme.spacing.xs,
  },
  balanceUnit: {
    paddingBottom: 4,
  },
  balanceSubtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  progressTrack: {
    flexDirection: 'row',
    height: 6,
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
    marginTop: theme.spacing.xs,
  },
  progressSegment: {
    height: '100%',
  },
  progressLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  statColumn: {
    flex: 1,
    gap: 2,
  },
  statLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  sectionHeaderText: {
    flex: 1,
  },
  orbitCard: {
    height: 220,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbitRing: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  orbitRingInner: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
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
  planetNode: {
    position: 'absolute',
    alignItems: 'center',
    gap: 4,
  },
  planetDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    gap: theme.spacing.sm,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceContainer,
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryText: {
    flex: 1,
    gap: 2,
  },
  categoryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  categoryTitle: {
    flexShrink: 1,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.xs,
  },
  categoryAmountColumn: {
    alignItems: 'flex-end',
    gap: 2,
  },
  aiCard: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    backgroundColor: theme.colors.surfaceContainerHigh,
  },
  aiIconBubble: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiText: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  aiHeadline: {
    marginTop: 2,
  },
  ctaButton: {
    marginTop: theme.spacing.xs,
  },
});
