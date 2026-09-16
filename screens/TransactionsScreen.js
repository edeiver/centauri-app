import { useFocusEffect } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { createTransactionRequest, getTransactionsRequest } from '../api';
import {
  AppText,
  AppTextInput,
  Button,
  CurrencyToggleButton,
  LanguageToggleButton,
  LoadingScreen,
  ThemeToggleButton,
} from '../components';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { useTheme } from '../theme';
import { getCategoryLabel, getCategoryOptions, OTHER_CATEGORY_ID } from '../utils/categories';
import { normalizeTransactions } from '../utils/transactions';

const INITIAL_FORM = { type: 'expense', amount: '', categoryId: '', customCategory: '' };

export default function TransactionsScreen() {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const { getValidToken } = useAuth();
  const { formatAmount } = useCurrency();
  const styles = createStyles(theme);
  const categoryOptions = useMemo(() => getCategoryOptions(t), [t]);
  const dateLocale = i18n.language === 'en' ? 'en-US' : 'es-CO';

  const formatDate = useCallback((date) => {
    if (!date) {
      return t('transactions.noDate');
    }

    const datePart = date.toLocaleDateString(dateLocale, { day: '2-digit', month: 'short' });
    const timePart = date.toLocaleTimeString(dateLocale, { hour: '2-digit', minute: '2-digit' });

    return `${datePart} · ${timePart}`;
  }, [t, dateLocale]);

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState('');

  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchTransactions = useCallback(async ({ silent } = {}) => {
    const token = getValidToken();

    if (!token) {
      setFetchError(t('transactions.sessionExpired'));
      setLoading(false);
      setRefreshing(false);
      return;
    }

    if (!silent) {
      setLoading(true);
    }
    setFetchError('');

    try {
      const data = await getTransactionsRequest(token);
      setTransactions(normalizeTransactions(data));
    } catch (error) {
      setFetchError(error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getValidToken, t]);

  // Refetch on focus, not just on mount — bottom-tab screens stay mounted
  // when you switch tabs, so a mount-only effect would never pick up
  // transactions added in a previous visit to this same tab.
  useFocusEffect(
    useCallback(() => {
      fetchTransactions();
    }, [fetchTransactions])
  );

  const sortedTransactions = useMemo(
    () => [...transactions].sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0)),
    [transactions]
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTransactions({ silent: true });
  };

  const openModal = () => {
    setForm(INITIAL_FORM);
    setFormError('');
    setModalVisible(true);
  };

  const closeModal = () => {
    if (submitting) {
      return;
    }
    setModalVisible(false);
  };

  const handleSubmit = async () => {
    setFormError('');

    const amountNumber = Number(form.amount.replace(',', '.'));
    const category = form.categoryId === OTHER_CATEGORY_ID
      ? form.customCategory.trim()
      : form.categoryId;

    if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
      setFormError(t('transactions.errorAmount'));
      return;
    }

    if (!category) {
      setFormError(t('transactions.errorCategory'));
      return;
    }

    const token = getValidToken();

    if (!token) {
      setFormError(t('transactions.sessionExpired'));
      return;
    }

    setSubmitting(true);

    try {
      await createTransactionRequest({ type: form.type, amount: amountNumber, category }, token);
      setModalVisible(false);
      setForm(INITIAL_FORM);
      await fetchTransactions({ silent: true });
    } catch (error) {
      setFormError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <Ionicons color={theme.colors.accent} name="planet-outline" size={18} />
          <AppText color="textMuted" variant="labelMd">CENTAURI</AppText>
          <AppText color="textMuted" variant="labelMd">/</AppText>
          <AppText variant="labelMd" weight="semiBold">{t('transactions.brand')}</AppText>
        </View>
        <View style={styles.headerActions}>
          <LanguageToggleButton />
          <CurrencyToggleButton />
          <ThemeToggleButton />
          <Pressable
            accessibilityLabel={t('transactions.addAccessibility')}
            accessibilityRole="button"
            onPress={openModal}
            style={styles.iconButton}
          >
            <Ionicons color={theme.colors.onSurface} name="add" size={20} />
          </Pressable>
        </View>
      </View>

      <View style={styles.titleRow}>
        <View style={styles.titleBlock}>
          <AppText variant="headlineLg" weight="bold">{t('transactions.title')}</AppText>
          <AppText color="textMuted" variant="bodySm">
            {t('transactions.subtitle')}
          </AppText>
        </View>
        <View style={styles.periodChip}>
          <AppText color="onSurfaceVariant" variant="labelSm">
            {t('transactions.records', { count: sortedTransactions.length })}
          </AppText>
        </View>
      </View>

      {loading && transactions.length === 0 && !fetchError ? (
        <LoadingScreen />
      ) : fetchError && transactions.length === 0 ? (
        <View style={styles.centeredState}>
          <Ionicons color={theme.colors.error} name="alert-circle-outline" size={28} />
          <AppText align="center" color="textMuted" variant="bodyMd">{fetchError}</AppText>
          <Button onPress={() => fetchTransactions()} title={t('common.retry')} variant="outline" />
        </View>
      ) : (
        <FlatList
          contentContainerStyle={styles.listContent}
          data={sortedTransactions}
          keyExtractor={(item) => String(item.id)}
          ListEmptyComponent={(
            <View style={styles.centeredState}>
              <Ionicons color={theme.colors.textMuted} name="planet-outline" size={28} />
              <AppText align="center" color="textMuted" variant="bodyMd">
                {t('transactions.emptyList')}
              </AppText>
            </View>
          )}
          refreshControl={(
            <RefreshControl
              onRefresh={handleRefresh}
              refreshing={refreshing}
              tintColor={theme.colors.accent}
            />
          )}
          renderItem={({ item }) => {
            const isIncome = item.type === 'income';
            const tintColor = isIncome ? 'accent' : 'error';

            return (
              <View style={styles.transactionCard}>
                <View
                  style={[
                    styles.transactionIcon,
                    { backgroundColor: theme.colors.surfaceContainerHigh, borderColor: theme.colors[tintColor] },
                  ]}
                >
                  <Ionicons
                    color={theme.colors[tintColor]}
                    name={isIncome ? 'arrow-down' : 'arrow-up'}
                    size={18}
                  />
                </View>
                <View style={styles.transactionText}>
                  <AppText numberOfLines={1} variant="bodyMd" weight="semiBold">
                    {getCategoryLabel(item.category, t)}
                  </AppText>
                  <AppText color="textMuted" variant="bodySm">{formatDate(item.date)}</AppText>
                </View>
                <AppText color={tintColor} variant="bodyMd" weight="semiBold">
                  {isIncome ? '+' : '-'}{formatAmount(item.amount)}
                </AppText>
              </View>
            );
          }}
        />
      )}

      <Modal animationType="slide" onRequestClose={closeModal} transparent visible={modalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalPanel}>
            <View style={styles.modalHeaderRow}>
              <AppText variant="headlineSm" weight="semiBold">{t('transactions.modalTitle')}</AppText>
              <Pressable accessibilityLabel={t('transactions.closeAccessibility')} accessibilityRole="button" disabled={submitting} onPress={closeModal}>
                <Ionicons color={theme.colors.textMuted} name="close" size={22} />
              </Pressable>
            </View>

            <View style={styles.typeToggleRow}>
              <Button
                disabled={submitting}
                onPress={() => setForm((current) => ({ ...current, type: 'expense' }))}
                style={styles.typeButton}
                title={t('transactions.expense')}
                variant={form.type === 'expense' ? 'primary' : 'outline'}
              />
              <Button
                disabled={submitting}
                onPress={() => setForm((current) => ({ ...current, type: 'income' }))}
                style={styles.typeButton}
                title={t('transactions.income')}
                variant={form.type === 'income' ? 'primary' : 'outline'}
              />
            </View>

            <AppTextInput
              autoComplete="off"
              autoCorrect={false}
              disabled={submitting}
              keyboardType="decimal-pad"
              label={t('transactions.amountLabel')}
              leftIcon={<Ionicons color={theme.colors.textMuted} name="cash-outline" size={16} />}
              onChangeText={(value) => setForm((current) => ({ ...current, amount: value }))}
              placeholder="0.00"
              spellCheck={false}
              value={form.amount}
            />

            <View style={styles.categoryBlock}>
              <AppText color="text" variant="bodySm" weight="medium">{t('transactions.categoryLabel')}</AppText>
              <View style={styles.categoryGrid}>
                {categoryOptions.map((item) => {
                  const selected = form.categoryId === item.id;

                  return (
                    <Pressable
                      key={item.id}
                      disabled={submitting}
                      onPress={() => setForm((current) => ({ ...current, categoryId: item.id }))}
                      style={[
                        styles.categoryChip,
                        {
                          borderColor: selected ? theme.colors.accent : theme.colors.border,
                          backgroundColor: selected ? theme.colors.surfaceContainerHigh : theme.colors.surface,
                        },
                      ]}
                    >
                      <Ionicons
                        color={selected ? theme.colors.accent : theme.colors.textMuted}
                        name={item.icon}
                        size={14}
                      />
                      <AppText color={selected ? 'accent' : 'textMuted'} variant="bodySm">
                        {item.label}
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {form.categoryId === OTHER_CATEGORY_ID ? (
              <AppTextInput
                autoComplete="off"
                autoCorrect={false}
                disabled={submitting}
                keyboardType="default"
                label={t('transactions.otherCategoryLabel')}
                leftIcon={<Ionicons color={theme.colors.textMuted} name="pricetag-outline" size={16} />}
                onChangeText={(value) => setForm((current) => ({ ...current, customCategory: value }))}
                placeholder={t('transactions.otherCategoryPlaceholder')}
                spellCheck={false}
                value={form.customCategory}
              />
            ) : null}

            {formError ? (
              <AppText color="error" variant="bodySm">{formError}</AppText>
            ) : null}

            <Button
              fullWidth
              loading={submitting}
              onPress={handleSubmit}
              title={t('transactions.submit')}
            />
          </View>
        </View>
      </Modal>
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  titleBlock: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  periodChip: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.surfaceContainerHigh,
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing['2xl'],
    gap: theme.spacing.sm,
  },
  centeredState: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing['2xl'],
    paddingHorizontal: theme.spacing.lg,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceContainer,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionText: {
    flex: 1,
    gap: 2,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalPanel: {
    backgroundColor: theme.colors.surfaceContainer,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  typeToggleRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  typeButton: {
    flex: 1,
  },
  categoryBlock: {
    gap: theme.spacing.xs,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
  },
});
