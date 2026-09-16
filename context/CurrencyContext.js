import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

import { CURRENCIES, CURRENCY_CODES, DEFAULT_CURRENCY, formatCurrency } from '../utils/currency';

const CURRENCY_KEY = 'centauri_currency';

const CurrencyContext = createContext({
  currency: DEFAULT_CURRENCY,
  currencyConfig: CURRENCIES[DEFAULT_CURRENCY],
  setCurrency: () => {},
  cycleCurrency: () => {},
  formatAmount: (value) => formatCurrency(value, DEFAULT_CURRENCY),
});

export function CurrencyProvider({ children }) {
  const [currency, setCurrencyState] = useState(DEFAULT_CURRENCY);

  // Restore a persisted choice so it doesn't reset to the default on every
  // reload/relaunch.
  useEffect(() => {
    (async () => {
      try {
        const stored = await SecureStore.getItemAsync(CURRENCY_KEY);

        if (stored && CURRENCIES[stored]) {
          setCurrencyState(stored);
        }
      } catch {
        // Falls back to the default currency.
      }
    })();
  }, []);

  const setCurrency = useCallback((next) => {
    setCurrencyState(next);
    SecureStore.setItemAsync(CURRENCY_KEY, next).catch(() => {});
  }, []);

  const cycleCurrency = useCallback(() => {
    setCurrencyState((current) => {
      const index = CURRENCY_CODES.indexOf(current);
      const next = CURRENCY_CODES[(index + 1) % CURRENCY_CODES.length];

      SecureStore.setItemAsync(CURRENCY_KEY, next).catch(() => {});

      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      currency,
      currencyConfig: CURRENCIES[currency] || CURRENCIES[DEFAULT_CURRENCY],
      setCurrency,
      cycleCurrency,
      formatAmount: (amount) => formatCurrency(amount, currency),
    }),
    [currency, cycleCurrency, setCurrency]
  );

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
