import { useFocusEffect } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Share, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getInsightsRequest, getTransactionsRequest } from '../api';
import { AppText, Button, LanguageToggleButton, ThemeToggleButton } from '../components';
import { useAuth } from '../context/AuthContext';
import { useBudget } from '../context/BudgetContext';
import { useTheme } from '../theme';
import { normalizeInsightItem } from '../utils/insights';
import { markInsightsSeen } from '../utils/insightsSeen';

// Warnings lead (most actionable/urgent), then recommendations, then plain
// insights — the hero card always shows the single most important thing
// Centauri IA has to say, not just "the first item in the response". The
// backend caps every list at 3 items, so the remainder (after the hero)
// always fits fully on screen as a labeled grid — no need to hide anything
// behind horizontal scrolling.
const HERO_PRIORITY = ['warnings', 'recommendations', 'insights'];
const SECTION_ORDER = ['warnings', 'recommendations', 'insights'];

const TYPE_CONFIG = {
  insights: { icon: 'telescope-outline', tone: 'accent', labelKey: 'sectionInsightsTitle' },
  recommendations: { icon: 'compass-outline', tone: 'accent', labelKey: 'sectionRecommendationsTitle' },
  warnings: { icon: 'alert-circle-outline', tone: 'error', labelKey: 'sectionWarningsTitle' },
};

// Matches the backend's `ORDER BY created_at DESC LIMIT 50` window that
// feeds the AI prompt — shown so the hero card's context line ("Based on
// your last N transactions") is accurate, not just a guess.
const MAX_ANALYZED_TRANSACTIONS = 50;

export default function AICoachScreen({ navigation }) {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const { getValidToken } = useAuth();
  const { budget, openPrompt } = useBudget();
  const styles = createStyles(theme);

  const [data, setData] = useState({ insights: [], recommendations: [], warnings: [] });
  const [transactionCount, setTransactionCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchInsights = useCallback(async () => {
    const token = getValidToken();

    if (!token) {
      setError(t('aiCoach.sessionExpired'));
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const [result, transactionsData] = await Promise.all([
        getInsightsRequest(token, i18n.language),
        getTransactionsRequest(token),
      ]);
      setData(result);
      setTransactionCount(Array.isArray(transactionsData) ? transactionsData.length : 0);
      markInsightsSeen(result);
    } catch (fetchError) {
      setError(fetchError.message);
    } finally {
      setLoading(false);
    }
  }, [getValidToken, t, i18n.language]);

  // Refetch on focus, not just on mount — bottom-tab screens stay mounted
  // when you switch tabs, so a mount-only effect would go stale.
  useFocusEffect(
    useCallback(() => {
      fetchInsights();
    }, [fetchInsights])
  );

  const { hero, sections } = useMemo(() => {
    const typed = {
      insights: (data.insights || []).map((item, index) => ({
        ...normalizeInsightItem(item, index, t),
        id: `insights-${index}`,
        type: 'insights',
      })),
      recommendations: (data.recommendations || []).map((item, index) => ({
        ...normalizeInsightItem(item, index, t),
        id: `recommendations-${index}`,
        type: 'recommendations',
      })),
      warnings: (data.warnings || []).map((item, index) => ({
        ...normalizeInsightItem(item, index, t),
        id: `warnings-${index}`,
        type: 'warnings',
      })),
    };

    let heroItem = null;
    for (const key of HERO_PRIORITY) {
      if (typed[key].length > 0) {
        heroItem = typed[key][0];
        break;
      }
    }

    const builtSections = SECTION_ORDER
      .map((key) => ({
        key,
        items: typed[key].filter((item) => item.id !== heroItem?.id),
      }))
      .filter((section) => section.items.length > 0);

    return { hero: heroItem, sections: builtSections };
  }, [data, t]);

  const hasContent = Boolean(hero);

  const handleShare = useCallback(() => {
    if (!hero) {
      return;
    }

    const message = hero.body
      ? `${hero.title}\n\n${hero.body}\n\n— ${t('aiCoach.shareSignature')}`
      : `${hero.title}\n\n— ${t('aiCoach.shareSignature')}`;

    Share.share({ message }).catch(() => {
      // User cancelled or share sheet failed to open — nothing to recover.
    });
  }, [hero, t]);

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <Ionicons color={theme.colors.accent} name="planet-outline" size={18} />
          <AppText color="textMuted" variant="labelMd">CENTAURI</AppText>
          <AppText color="textMuted" variant="labelMd">/</AppText>
          <AppText variant="labelMd" weight="semiBold">{t('aiCoach.brand')}</AppText>
        </View>
        <View style={styles.headerActions}>
          <LanguageToggleButton />
          <ThemeToggleButton />
          <Pressable
            accessibilityLabel={t('aiCoach.updateAccessibility')}
            accessibilityRole="button"
            onPress={fetchInsights}
            style={styles.iconButton}
          >
            <Ionicons color={theme.colors.onSurface} name="refresh" size={18} />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.titleBlock}>
          <View style={styles.chip}>
            <View style={[styles.dot, { backgroundColor: theme.colors.accent }]} />
            <AppText color="accent" variant="labelSm">{t('aiCoach.badge')}</AppText>
          </View>
          <AppText variant="headlineLg" weight="bold">{t('aiCoach.title')}</AppText>
          <AppText color="textMuted" variant="bodySm">
            {t('aiCoach.subtitle')}
          </AppText>
        </View>

        {loading ? (
          <View style={styles.centeredState}>
            <ActivityIndicator color={theme.colors.accent} size="large" />
            <AppText align="center" color="textMuted" variant="bodyMd">
              {t('aiCoach.scanning')}
            </AppText>
          </View>
        ) : error ? (
          <View style={styles.centeredState}>
            <Ionicons color={theme.colors.error} name="alert-circle-outline" size={28} />
            <AppText align="center" color="textMuted" variant="bodyMd">{error}</AppText>
            <Button onPress={fetchInsights} title={t('common.retry')} variant="outline" />
          </View>
        ) : !hasContent ? (
          <View style={styles.centeredState}>
            <Ionicons color={theme.colors.textMuted} name="planet-outline" size={28} />
            <AppText align="center" color="textMuted" variant="bodyMd">
              {t('aiCoach.emptyState')}
            </AppText>
          </View>
        ) : (
          <>
            <View
              style={[
                styles.heroCard,
                { borderColor: theme.colors[TYPE_CONFIG[hero.type].tone] },
                hero.type === 'warnings' && { backgroundColor: theme.colors.errorContainer },
              ]}
            >
              <View style={styles.heroHeaderRow}>
                <View style={styles.heroHeaderLeft}>
                  <View style={[styles.heroAvatar, { backgroundColor: theme.colors.surfaceContainerHigh }]}>
                    <Ionicons color={theme.colors.accent} name="sparkles" size={18} />
                  </View>
                  <AppText color="accent" variant="labelSm">CENTAURI IA</AppText>
                </View>
                <Pressable
                  accessibilityLabel={t('aiCoach.shareAccessibility')}
                  accessibilityRole="button"
                  hitSlop={8}
                  onPress={handleShare}
                >
                  <Ionicons color={theme.colors.textMuted} name="share-outline" size={18} />
                </Pressable>
              </View>
              <AppText variant="headlineSm" weight="bold">{hero.title}</AppText>
              {hero.body ? (
                <AppText color="textMuted" variant="bodyMd">{hero.body}</AppText>
              ) : null}
              {transactionCount > 0 ? (
                <AppText color="textMuted" variant="labelSm">
                  {t('aiCoach.contextLine', { count: Math.min(transactionCount, MAX_ANALYZED_TRANSACTIONS) })}
                </AppText>
              ) : null}
              <Button
                onPress={
                  hero.type === 'warnings' && !budget
                    ? openPrompt
                    : () => navigation.navigate('Transactions')
                }
                rightIcon={<Ionicons color={theme.colors.text} name="arrow-forward" size={16} />}
                style={styles.heroCta}
                title={hero.type === 'warnings' && !budget ? t('aiCoach.heroCtaBudget') : t('aiCoach.heroCta')}
                variant="outline"
              />
            </View>

            {sections.map((section) => {
              const config = TYPE_CONFIG[section.key];

              return (
                <View key={section.key} style={styles.section}>
                  <View style={styles.sectionHeaderRow}>
                    <Ionicons color={theme.colors[config.tone]} name={config.icon} size={16} />
                    <AppText variant="headlineSm" weight="semiBold">{t(`aiCoach.${config.labelKey}`)}</AppText>
                  </View>

                  <View style={styles.grid}>
                    {section.items.map((item) => (
                      <View
                        key={item.id}
                        style={[
                          styles.gridCard,
                          { borderColor: theme.colors[config.tone] },
                          config.tone === 'error' && { backgroundColor: theme.colors.errorContainer },
                        ]}
                      >
                        <AppText variant="bodyMd" weight="semiBold">
                          {item.title}
                        </AppText>
                        {item.body ? (
                          <AppText color="textMuted" variant="bodySm">
                            {item.body}
                          </AppText>
                        ) : null}
                      </View>
                    ))}
                  </View>
                </View>
              );
            })}
          </>
        )}
      </ScrollView>
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
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
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
  content: {
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing['2xl'],
    gap: theme.spacing.lg,
  },
  titleBlock: {
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
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
  centeredState: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing['2xl'],
    paddingHorizontal: theme.spacing.lg,
  },
  heroCard: {
    gap: theme.spacing.sm,
    marginHorizontal: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    backgroundColor: theme.colors.surfaceContainerHigh,
  },
  heroHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.xs,
  },
  heroHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    gap: theme.spacing.xs,
  },
  heroAvatar: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCta: {
    alignSelf: 'flex-start',
    marginTop: theme.spacing.xs,
  },
  section: {
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  gridCard: {
    flexBasis: '47%',
    flexGrow: 1,
    gap: theme.spacing.xs,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    backgroundColor: theme.colors.surfaceContainer,
  },
});
