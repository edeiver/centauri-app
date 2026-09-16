// Display-only formatting config. The backend stores raw NUMERIC(12,2)
// amounts with no currency column at all (see centauri-ai-backend's
// db/schema.sql), so switching currency here does NOT convert values —
// it only changes how the same stored number is rendered (symbol, decimal
// places, thousands separator). Add more entries here as new currencies
// are supported.
export const CURRENCIES = {
  COP: {
    code: 'COP',
    locale: 'es-CO',
    label: 'Peso colombiano',
    symbol: '$',
    fractionDigits: 0,
  },
  USD: {
    code: 'USD',
    locale: 'en-US',
    label: 'Dólar estadounidense',
    symbol: 'US$',
    fractionDigits: 2,
  },
};

export const CURRENCY_CODES = Object.keys(CURRENCIES);
export const DEFAULT_CURRENCY = 'COP';

export function formatCurrency(value, currencyCode = DEFAULT_CURRENCY) {
  const config = CURRENCIES[currencyCode] || CURRENCIES[DEFAULT_CURRENCY];
  const numeric = Number(value) || 0;
  const sign = numeric < 0 ? '-' : '';
  const formatted = Math.abs(numeric).toLocaleString(config.locale, {
    minimumFractionDigits: config.fractionDigits,
    maximumFractionDigits: config.fractionDigits,
  });

  return `${sign}${config.symbol}${formatted}`;
}
