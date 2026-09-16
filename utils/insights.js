// GET /ai/insights returns { insights, recommendations, warnings }; each entry's
// exact shape (plain string vs {title, message, ...}) isn't pinned down, so this
// tolerates both instead of assuming one.
export function normalizeInsightItem(item, index, t) {
  if (typeof item === 'string') {
    return { id: `item-${index}`, title: item, body: null };
  }

  const title = item?.title || item?.headline || item?.message || item?.text || t('common.diagnosticFallback');
  const body = item?.description || item?.body
    || (item?.message && item.message !== title ? item.message : null);

  return { id: item?.id ?? `item-${index}`, title, body };
}

export function getPrimaryInsight({ insights, recommendations, warnings } = {}, t) {
  const source = insights?.length ? insights : recommendations?.length ? recommendations : warnings;
  const [first] = source || [];

  return first ? normalizeInsightItem(first, 0, t) : null;
}
