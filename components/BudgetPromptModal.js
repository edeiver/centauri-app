import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useState } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useBudget } from '../context/BudgetContext';
import { useTheme } from '../theme';
import AppText from './AppText';
import AppTextInput from './AppTextInput';
import Button from './Button';

export default function BudgetPromptModal() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { showPrompt, dismissPrompt, createBudget } = useBudget();
  const styles = createStyles(theme);

  const [amount, setAmount] = useState('');
  const [days, setDays] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setError('');

    const amountNumber = Number(amount.replace(',', '.'));
    const daysNumber = Number(days);

    if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
      setError(t('budget.errorAmount'));
      return;
    }

    if (!Number.isInteger(daysNumber) || daysNumber <= 0 || daysNumber > 365) {
      setError(t('budget.errorDays'));
      return;
    }

    setSubmitting(true);

    try {
      await createBudget({ amount: amountNumber, days: daysNumber });
      setAmount('');
      setDays('');
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemindLater = () => {
    if (submitting) {
      return;
    }
    setError('');
    dismissPrompt();
  };

  return (
    <Modal animationType="slide" onRequestClose={handleRemindLater} transparent visible={showPrompt}>
      <View style={styles.overlay}>
        <View style={styles.panel}>
          <View style={[styles.iconBubble, { backgroundColor: theme.colors.surfaceContainerHigh }]}>
            <Ionicons color={theme.colors.accent} name="rocket-outline" size={22} />
          </View>

          <AppText variant="headlineSm" weight="semiBold">{t('budget.promptTitle')}</AppText>
          <AppText color="textMuted" variant="bodySm">{t('budget.promptSubtitle')}</AppText>

          <AppTextInput
            autoComplete="off"
            autoCorrect={false}
            disabled={submitting}
            keyboardType="decimal-pad"
            label={t('budget.amountLabel')}
            leftIcon={<Ionicons color={theme.colors.textMuted} name="cash-outline" size={16} />}
            onChangeText={setAmount}
            placeholder={t('budget.amountPlaceholder')}
            spellCheck={false}
            value={amount}
          />

          <AppTextInput
            autoComplete="off"
            autoCorrect={false}
            disabled={submitting}
            keyboardType="number-pad"
            label={t('budget.daysLabel')}
            leftIcon={<Ionicons color={theme.colors.textMuted} name="calendar-outline" size={16} />}
            onChangeText={setDays}
            placeholder={t('budget.daysPlaceholder')}
            spellCheck={false}
            value={days}
          />

          {error ? (
            <AppText color="error" variant="bodySm">{error}</AppText>
          ) : null}

          <Button fullWidth loading={submitting} onPress={handleSubmit} title={t('budget.submit')} />
          <Button
            disabled={submitting}
            fullWidth
            onPress={handleRemindLater}
            title={t('budget.remindLater')}
            variant="ghost"
          />
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (theme) => StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  panel: {
    backgroundColor: theme.colors.surfaceContainer,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  iconBubble: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
