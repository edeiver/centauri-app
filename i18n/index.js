// Hermes (RN's JS engine) doesn't implement Intl.PluralRules, which i18next
// needs for the _one/_other plural keys used across the locale files — the
// force variant is used (not the auto-detecting one) because the detection
// path is known to be slow on Android.
import '@formatjs/intl-pluralrules/polyfill-force.js';
import '@formatjs/intl-pluralrules/locale-data/en.js';
import '@formatjs/intl-pluralrules/locale-data/es.js';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as SecureStore from 'expo-secure-store';

import en from './locales/en';
import es from './locales/es';

export const LANGUAGE_KEY = 'centauri_language';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es },
    },
    lng: 'en',
    fallbackLng: 'en',
    compatibilityJSON: 'v4',
    interpolation: {
      escapeValue: false,
    },
  });

// Restore a persisted language choice so it doesn't reset to Spanish on
// every reload/relaunch. Runs after init (SecureStore is async, init isn't),
// so there can be a brief flash of the default language on cold start.
SecureStore.getItemAsync(LANGUAGE_KEY)
  .then((stored) => {
    if ((stored === 'en' || stored === 'es') && stored !== i18n.language) {
      i18n.changeLanguage(stored);
    }
  })
  .catch(() => {
    // Falls back to the default language.
  });

export default i18n;
