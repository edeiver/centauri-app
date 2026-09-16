import React from 'react';
import { useTranslation } from 'react-i18next';

import { PlaceholderScreen } from '../components';

export default function PinSetupScreen({ navigation }) {
  const { t } = useTranslation();

  return (
    <PlaceholderScreen
      actionLabel={t('pinSetup.back')}
      eyebrow={t('pinSetup.eyebrow')}
      onAction={() => navigation.goBack()}
      subtitle={t('pinSetup.subtitle')}
      title={t('pinSetup.title')}
    />
  );
}
