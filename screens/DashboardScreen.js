import { useFocusEffect } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Animated, Easing, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getInsightsRequest, getTransactionsRequest } from '../api';
import {
  AppText,
  Button,
  CurrencyToggleButton,
  LanguageToggleButton,
  LoadingScreen,
  ThemeToggleButton,
} from '../components';
import { useAuth } from '../context/AuthContext';
import { useBudget } from '../context/BudgetContext';
import { useCurrency } from '../context/CurrencyContext';
import { useTheme } from '../theme';
import { getCategoryIcon, getCategoryLabel } from '../utils/categories';
import { getPrimaryInsight } from '../utils/insights';
import { hasNewInsights, markInsightsSeen } from '../utils/insightsSeen';
import { normalizeTransactions } from '../utils/transactions';
import { getExpenseTrend } from '../utils/trends';

// Only used for categories with no known icon mapping in utils/categories.js
// (free-text "Otro" entries, or anything created before that picker existed).
const FALLBACK_CATEGORY_ICONS = ['sparkles', 'cafe', 'bag-handle', 'film', 'restaurant', 'cart', 'car', 'home'];
const CATEGORY_COLORS = ['accentAlt', 'error', 'accent', 'onSurfaceVariant'];

function buildDashboardSummary(transactions, insightsData, t, dateLocale) {
  const incomeTx = transactions.filter((tx) => tx.type === 'income');
  const expenseTx = transactions.filter((tx) => tx.type === 'expense');

  const income = incomeTx.reduce((sum, tx) => sum + tx.amount, 0);
  const expenses = expenseTx.reduce((sum, tx) => sum + tx.amount, 0);
  const available = income - expenses;
  const spendPct = income > 0
    ? Math.min(100, Math.round((expenses / income) * 100))
    : (expenses > 0 ? 100 : 0);
  const reservePct = 100 - spendPct;
  const incomeSources = new Set(incomeTx.map((tx) => tx.category)).size;

  const categoryTotals = new Map();
  expenseTx.forEach((tx) => {
    const current = categoryTotals.get(tx.category) || { amount: 0, count: 0 };
    current.amount += tx.amount;
    current.count += 1;
    categoryTotals.set(tx.category, current);
  });

  const categories = Array.from(categoryTotals.entries())
    .map(([category, stats], index) => ({
      id: category,
      icon: getCategoryIcon(category) || FALLBACK_CATEGORY_ICONS[index % FALLBACK_CATEGORY_ICONS.length],
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
      title: t('dashboard.categoryTitle', { category: getCategoryLabel(category, t) }),
      subtitle: t('dashboard.categorySubtitle', {
        pct: expenses > 0 ? ((stats.amount / expenses) * 100).toFixed(1) : '0.0',
      }),
      amount: stats.amount,
      status: t('dashboard.categoryStatus', { count: stats.count }),
    }))
    .sort((a, b) => b.amount - a.amount);

  const topCategories = categories.slice(0, 4);
  const planets = topCategories.map((category, index) => ({
    id: category.id,
    label: getCategoryLabel(category.id, t),
    icon: category.icon,
    color: category.color,
    angle: -90 + index * (360 / topCategories.length),
  }));

  const now = new Date();
  const todaysTx = transactions
    .filter((tx) => tx.date && tx.date.toDateString() === now.toDateString())
    .sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0));
  const usingToday = todaysTx.length > 0;
  const recentTx = [...transactions]
    .sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0))
    .slice(0, 3);

  const todayTransactions = (usingToday ? todaysTx : recentTx).slice(0, 4).map((tx) => {
    const categoryMeta = categories.find((category) => category.id === tx.category);

    return {
      id: tx.id,
      icon: categoryMeta?.icon || 'ellipse-outline',
      title: t('dashboard.categoryTitle', { category: getCategoryLabel(tx.category, t) }),
      subtitle: tx.date
        ? t('dashboard.eventTime', {
          time: tx.date.toLocaleTimeString(dateLocale, { hour: '2-digit', minute: '2-digit' }),
        })
        : t('dashboard.noTimeAvailable'),
      amount: tx.type === 'expense' ? -tx.amount : tx.amount,
      method: tx.type === 'income' ? t('dashboard.income') : t('dashboard.expense'),
    };
  });

  const primaryInsight = getPrimaryInsight(insightsData, t);
  const aiInsight = primaryInsight
    ? {
      headline: primaryInsight.title,
      body: primaryInsight.body || t('dashboard.aiDefaultBody'),
    }
    : {
      headline: t('dashboard.aiEmptyHeadline'),
      body: t('dashboard.aiEmptyBody'),
    };

  return {
    balance: {
      available,
      reservePct,
      spendPct,
      income,
      incomeSources,
      expenses,
      expensesCount: expenseTx.length,
    },
    categories: categories.slice(0, 5),
    planets,
    aiInsight,
    todayTransactions,
    usingToday,
  };
}

export default function DashboardScreen({ navigation }) {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const { user, getValidToken } = useAuth();
  const { currencyConfig, formatAmount } = useCurrency();
  const { budget, hasNotification, acknowledgeCycleEnded } = useBudget();
  const styles = createStyles(theme);
  const dateLocale = i18n.language === 'en' ? 'en-US' : 'es-CO';
  const firstName = user?.name?.split(' ')[0] || t('dashboard.defaultName');

  const [transactions, setTransactions] = useState([]);
  const [insightsData, setInsightsData] = useState({ insights: [], recommendations: [], warnings: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasNewInsight, setHasNewInsight] = useState(false);

  // "New insight" is tracked locally (fingerprint compare) since GET
  // /ai/insights has no unread flag — it always returns the current 6h
  // cached snapshot. Visiting AI Coach clears it (markInsightsSeen there).
  useEffect(() => {
    let isActive = true;

    hasNewInsights(insightsData).then((result) => {
      if (isActive) {
        setHasNewInsight(result);
      }
    });

    return () => {
      isActive = false;
    };
  }, [insightsData]);

  const handleNotificationsPress = () => {
    if (hasNotification) {
      Alert.alert(t('budget.cycleEndedTitle'), t('budget.cycleEndedBody'), [
        { text: t('budget.ok'), onPress: acknowledgeCycleEnded },
      ]);
    } else if (hasNewInsight) {
      markInsightsSeen(insightsData);
      setHasNewInsight(false);
      navigation.navigate('AICoach');
    } else {
      Alert.alert(t('budget.notificationsTitle'), t('budget.noNotifications'));
    }
  };

  // Gentle breathing pulse on the orbit's central sun — driven manually
  // (reset + restart on finish) rather than Animated.loop, which doesn't
  // reset cleanly on this RN version (see WelcomeScreen's orbit animation).
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let isActive = true;
    let currentAnimation = null;

    const animate = () => {
      if (!isActive) {
        return;
      }

      pulse.setValue(0);
      currentAnimation = Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]);
      currentAnimation.start(({ finished }) => {
        if (finished && isActive) {
          animate();
        }
      });
    };

    animate();

    return () => {
      isActive = false;
      currentAnimation?.stop();
    };
  }, [pulse]);

  const pulseScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.1] });
  const pulseOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] });
  const glowScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.7] });
  const glowOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.32, 0] });

  const fetchDashboardData = useCallback(async () => {
    const token = getValidToken();

    if (!token) {
      setError(t('dashboard.sessionExpired'));
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const [transactionsData, insights] = await Promise.all([
        getTransactionsRequest(token),
        getInsightsRequest(token, i18n.language),
      ]);
      setTransactions(normalizeTransactions(transactionsData));
      setInsightsData(insights);
    } catch (fetchError) {
      setError(fetchError.message);
    } finally {
      setLoading(false);
    }
  }, [getValidToken, t, i18n.language]);

  // Bottom-tab screens stay mounted when you switch tabs, so a plain
  // mount-only effect never refetches after the first load — refetching on
  // focus is what actually picks up transactions added from the other tab.
  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [fetchDashboardData])
  );

  const summary = useMemo(
    () => buildDashboardSummary(transactions, insightsData, t, dateLocale),
    [transactions, insightsData, t, dateLocale]
  );
  const { balance: BALANCE, categories: CATEGORIES, planets: PLANETS, aiInsight: AI_INSIGHT, todayTransactions: TODAY_TRANSACTIONS, usingToday } = summary;
  const periodLabel = new Date().toLocaleDateString(dateLocale, { month: 'short', year: 'numeric' }).toUpperCase();
  const expenseTrend = useMemo(() => getExpenseTrend(transactions), [transactions]);

  const budgetProgress = useMemo(() => {
    if (!budget) {
      return null;
    }

    const startTime = new Date(budget.start_date).getTime();
    const endTime = new Date(budget.end_date).getTime();
    const spent = transactions
      .filter((tx) => tx.type === 'expense' && tx.date && tx.date.getTime() >= startTime)
      .reduce((sum, tx) => sum + tx.amount, 0);
    const total = Number(budget.amount) || 0;
    const pct = total > 0 ? Math.round((spent / total) * 100) : 0;
    const daysLeft = Math.max(0, Math.ceil((endTime - Date.now()) / (1000 * 60 * 60 * 24)));

    return { spent, total, pct, daysLeft, overBudget: spent > total };
  }, [transactions, budget]);

  if (loading && transactions.length === 0 && !error) {
    return <LoadingScreen />;
  }

  if (error && transactions.length === 0) {
    return (
      <SafeAreaView edges={['top']} style={styles.screen}>
        <View style={styles.errorState}>
          <Ionicons color={theme.colors.error} name="alert-circle-outline" size={28} />
          <AppText align="center" color="textMuted" variant="bodyMd">{error}</AppText>
          <Button onPress={fetchDashboardData} title={t('common.retry')} variant="outline" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <Ionicons color={theme.colors.accent} name="planet-outline" size={18} />
            <AppText color="textMuted" variant="labelMd">CENTAURI</AppText>
            <AppText color="textMuted" variant="labelMd">/</AppText>
            <AppText variant="labelMd" weight="semiBold">{t('dashboard.brand')}</AppText>
          </View>
          <View style={styles.headerActions}>
            <LanguageToggleButton />
            <CurrencyToggleButton />
            <ThemeToggleButton />
            <Pressable
              accessibilityLabel={t('budget.notificationsTitle')}
              accessibilityRole="button"
              onPress={handleNotificationsPress}
              style={styles.iconButton}
            >
              <Ionicons color={theme.colors.onSurface} name="notifications-outline" size={18} />
              {hasNotification || hasNewInsight ? (
                <View style={[styles.notificationDot, { backgroundColor: theme.colors.error }]} />
              ) : null}
            </Pressable>
            <View style={[styles.avatar, { backgroundColor: theme.colors.primaryContainer }]}>
              <Ionicons color={theme.colors.onPrimary} name="person" size={18} />
            </View>
          </View>
        </View>

        <View style={styles.greetingCard}>
          <View style={styles.greetingText}>
            <View style={styles.chip}>
              <View style={[styles.dot, { backgroundColor: theme.colors.accent }]} />
              <AppText color="accent" variant="labelSm">{t('dashboard.greetingCycle')}</AppText>
            </View>
            <AppText style={styles.greetingTitle} variant="headlineLg" weight="bold">
              {t('dashboard.greeting', { name: firstName })}
            </AppText>
            <AppText color="textMuted" variant="bodySm">
              {t('dashboard.atmosphere')}
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
                {t('dashboard.cardHeader')}
              </AppText>
            </View>
            <View style={styles.periodChip}>
              <AppText color="onSurfaceVariant" variant="labelSm">{periodLabel}</AppText>
            </View>
          </View>

          <View style={styles.balanceRow}>
            <AppText color={BALANCE.available < 0 ? 'error' : 'text'} variant="numericHero" weight="bold">
              {formatAmount(BALANCE.available)}
            </AppText>
            <AppText color="textMuted" style={styles.balanceUnit} variant="bodyMd">
              {currencyConfig.code}
            </AppText>
          </View>
          <View style={styles.balanceSubtitleRow}>
            <View style={[styles.dot, { backgroundColor: theme.colors.accent }]} />
            <AppText color="textMuted" variant="bodySm">
              {t('dashboard.reservePct', { pct: BALANCE.reservePct })}
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
              {t('dashboard.reserveProtected', { pct: BALANCE.reservePct })}
            </AppText>
            <AppText color="error" variant="bodySm">
              {t('dashboard.spend', { pct: BALANCE.spendPct })}
            </AppText>
          </View>

          <View style={styles.divider} />

          <View style={styles.statsRow}>
            <View style={styles.statColumn}>
              <View style={styles.statLabelRow}>
                <Ionicons color={theme.colors.accent} name="arrow-down" size={14} />
                <AppText color="textMuted" variant="labelSm">{t('dashboard.incomeLabel')}</AppText>
              </View>
              <AppText variant="titleMd" weight="semiBold">
                {formatAmount(BALANCE.income)}
              </AppText>
              <AppText color="textMuted" variant="bodySm">
                {t('dashboard.incomeSources', { count: BALANCE.incomeSources })}
              </AppText>
            </View>
            <View style={styles.statColumn}>
              <View style={styles.statLabelRow}>
                <Ionicons color={theme.colors.error} name="arrow-up" size={14} />
                <AppText color="textMuted" variant="labelSm">{t('dashboard.expensesLabel')}</AppText>
              </View>
              <AppText variant="titleMd" weight="semiBold">
                {formatAmount(BALANCE.expenses)}
              </AppText>
              <AppText color="textMuted" variant="bodySm">
                {t('dashboard.expensesCount', { count: BALANCE.expensesCount })}
              </AppText>
              {expenseTrend ? (
                <View style={styles.trendRow}>
                  <Ionicons
                    color={expenseTrend.direction === 'up' ? theme.colors.error : theme.colors.accent}
                    name={expenseTrend.direction === 'up' ? 'trending-up' : expenseTrend.direction === 'down' ? 'trending-down' : 'remove'}
                    size={12}
                  />
                  <AppText color={expenseTrend.direction === 'up' ? 'error' : 'accent'} variant="bodySm">
                    {expenseTrend.direction === 'flat'
                      ? t('dashboard.trendFlat')
                      : t(expenseTrend.direction === 'up' ? 'dashboard.trendUp' : 'dashboard.trendDown', { pct: expenseTrend.pct })}
                  </AppText>
                </View>
              ) : null}
            </View>
          </View>
        </View>

        {budgetProgress ? (
          <View style={styles.budgetCard}>
            <View style={styles.budgetHeaderRow}>
              <AppText variant="titleMd" weight="semiBold">{t('budget.cardTitle')}</AppText>
              <AppText color={budgetProgress.overBudget ? 'error' : 'accent'} variant="labelSm">
                {budgetProgress.daysLeft === 0
                  ? t('budget.daysLeftNone')
                  : t('budget.daysLeft', { count: budgetProgress.daysLeft })}
              </AppText>
            </View>
            <AppText color="textMuted" variant="bodySm">
              {t('budget.cardSpent', {
                spent: formatAmount(budgetProgress.spent),
                total: formatAmount(budgetProgress.total),
              })}
            </AppText>
            <View style={styles.budgetTrack}>
              <View
                style={[
                  styles.budgetFill,
                  {
                    width: `${Math.min(100, budgetProgress.pct)}%`,
                    backgroundColor: budgetProgress.overBudget ? theme.colors.error : theme.colors.accent,
                  },
                ]}
              />
            </View>
            <AppText color={budgetProgress.overBudget ? 'error' : 'accent'} variant="bodySm">
              {budgetProgress.overBudget ? t('budget.overBudget') : t('budget.onTrack')}
            </AppText>
          </View>
        ) : null}

        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionHeaderText}>
            <AppText variant="headlineSm" weight="semiBold">{t('dashboard.planetsTitle')}</AppText>
            <AppText color="textMuted" variant="bodySm">
              {t('dashboard.planetsSubtitle')}
            </AppText>
          </View>
          <AppText color="accent" variant="labelSm">{t('dashboard.map')}</AppText>
        </View>

        {PLANETS.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons color={theme.colors.textMuted} name="planet-outline" size={24} />
            <AppText align="center" color="textMuted" variant="bodySm">
              {t('dashboard.emptyPlanets')}
            </AppText>
          </View>
        ) : (
          <View style={styles.orbitCard}>
            <View style={styles.orbitRing} />
            <View style={styles.orbitRingInner} />
            <Animated.View
              style={[
                styles.coreGlow,
                { backgroundColor: theme.colors.accent, opacity: glowOpacity, transform: [{ scale: glowScale }] },
              ]}
            />
            <Animated.View
              style={[
                styles.core,
                {
                  backgroundColor: theme.colors.surfaceContainerHigh,
                  opacity: pulseOpacity,
                  transform: [{ scale: pulseScale }],
                },
              ]}
            >
              <Ionicons color={theme.colors.accent} name="sunny" size={18} />
            </Animated.View>
            {PLANETS.map((planet) => {
              const radius = 70;
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
                  <AppText color="textMuted" numberOfLines={1} style={styles.planetLabel} variant="bodySm">
                    {planet.label}
                  </AppText>
                </View>
              );
            })}
          </View>
        )}

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
                <AppText variant="bodyMd" weight="semiBold">{formatAmount(category.amount)}</AppText>
                <AppText color="accent" variant="bodySm">{category.status}</AppText>
              </View>
            </View>
          ))}
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate('AICoach')}
          style={({ pressed }) => [
            styles.aiCard,
            { borderColor: theme.colors.accent },
            pressed && styles.aiCardPressed,
          ]}
        >
          <View style={[styles.aiIconBubble, { backgroundColor: theme.colors.surfaceContainerHigh }]}>
            <Ionicons color={theme.colors.accent} name="bulb-outline" size={18} />
          </View>
          <View style={styles.aiText}>
            <View style={styles.chip}>
              <View style={[styles.dot, { backgroundColor: theme.colors.accent }]} />
              <AppText color="accent" variant="labelSm">{t('dashboard.aiAlert')}</AppText>
            </View>
            <AppText style={styles.aiHeadline} variant="bodyMd" weight="semiBold">
              {AI_INSIGHT.headline}
            </AppText>
            <AppText color="textMuted" variant="bodySm">{AI_INSIGHT.body}</AppText>
          </View>
          <Ionicons color={theme.colors.accent} name="chevron-forward" size={18} />
        </Pressable>

        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionHeaderText}>
            <AppText variant="headlineSm" weight="semiBold">
              {usingToday ? t('dashboard.telemetryToday') : t('dashboard.telemetryRecent')}
            </AppText>
            <AppText color="textMuted" variant="bodySm">
              {usingToday ? t('dashboard.telemetryTodaySubtitle') : t('dashboard.telemetryRecentSubtitle')}
            </AppText>
          </View>
          <View style={styles.periodChip}>
            <AppText color="onSurfaceVariant" variant="labelSm">
              {t('dashboard.events', { count: TODAY_TRANSACTIONS.length })}
            </AppText>
          </View>
        </View>

        {TODAY_TRANSACTIONS.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons color={theme.colors.textMuted} name="time-outline" size={24} />
            <AppText align="center" color="textMuted" variant="bodySm">
              {t('dashboard.emptyTransactions')}
            </AppText>
          </View>
        ) : (
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
                    {formatAmount(transaction.amount)}
                  </AppText>
                  <AppText color="textMuted" variant="bodySm">{transaction.method}</AppText>
                </View>
              </View>
            ))}
          </View>
        )}

        <Button
          fullWidth
          leftIcon={<Ionicons color={theme.colors.accent} name="add-circle-outline" size={18} />}
          onPress={() => navigation.navigate('Transactions')}
          style={styles.ctaButton}
          title={t('dashboard.cta')}
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
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: theme.spacing.xs,
    paddingTop: theme.spacing.sm,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
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
  notificationDot: {
    position: 'absolute',
    top: 6,
    right: 7,
    width: 8,
    height: 8,
    borderRadius: 4,
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
  budgetCard: {
    backgroundColor: theme.colors.surfaceContainer,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    gap: theme.spacing.xs,
  },
  budgetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: theme.spacing.xs,
  },
  budgetTrack: {
    height: 6,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surfaceContainerHighest,
    overflow: 'hidden',
    marginTop: theme.spacing.xs,
  },
  budgetFill: {
    height: '100%',
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
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
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
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbitRing: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  orbitRingInner: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
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
  coreGlow: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
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
  planetLabel: {
    maxWidth: 80,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceContainerLow,
  },
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
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
    alignItems: 'center',
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    backgroundColor: theme.colors.surfaceContainerHigh,
  },
  aiCardPressed: {
    opacity: 0.7,
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
