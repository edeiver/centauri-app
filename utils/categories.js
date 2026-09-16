// The backend has no categories endpoint or enum — `category` on
// POST /transactions is just a free VARCHAR(50) (see centauri-ai-backend's
// transaction.controller.js / db/schema.sql). This fixed list is a
// frontend-only convenience so Dashboard grouping stays consistent; if the
// backend ever exposes a real categories endpoint, swap the source here and
// the rest of the app (which only reads CATEGORY_IDS/OTHER_CATEGORY_ID) keeps
// working unchanged.
//
// `id` is what actually gets sent to the backend and stored — never the
// translated label — so a transaction categorized in Spanish still displays
// correctly if the user later switches to English (see getCategoryLabel).
export const CATEGORY_IDS = [
  'mercado',
  'transporte',
  'vivienda',
  'restaurantes',
  'entretenimiento',
  'salud',
  'suscripciones',
  'educacion',
  'ropa',
];

export const OTHER_CATEGORY_ID = 'otro';

const CATEGORY_ICONS = {
  mercado: 'cart-outline',
  transporte: 'car-outline',
  vivienda: 'home-outline',
  restaurantes: 'restaurant-outline',
  entretenimiento: 'film-outline',
  salud: 'medkit-outline',
  suscripciones: 'repeat-outline',
  educacion: 'school-outline',
  ropa: 'shirt-outline',
  [OTHER_CATEGORY_ID]: 'ellipsis-horizontal-outline',
};

export function getCategoryOptions(t) {
  return [...CATEGORY_IDS, OTHER_CATEGORY_ID].map((id) => ({
    id,
    icon: CATEGORY_ICONS[id],
    label: t(`categories.${id}`),
  }));
}

// Transactions store the category id (e.g. "mercado") for known categories,
// but free text for "Otro" or for anything created before this picker
// existed (e.g. "Cena") — those fall back to the raw stored string as-is.
export function getCategoryLabel(rawCategory, t) {
  if (CATEGORY_IDS.includes(rawCategory)) {
    return t(`categories.${rawCategory}`);
  }

  return rawCategory;
}

// Returns null for free-text categories (custom "Otro" entries, or anything
// created before this picker existed) so callers can fall back to their own
// generic/cycling icon instead of guessing one.
export function getCategoryIcon(rawCategory) {
  return CATEGORY_ICONS[rawCategory] || null;
}
