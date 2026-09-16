// GET /transactions' exact field names beyond the POST body shape
// ({type, amount, category}) aren't confirmed, so this tolerates the common
// variants (createdAt vs created_at, etc.) instead of assuming one.
export function normalizeTransaction(raw, index = 0) {
  const amount = Number(raw?.amount) || 0;
  const type = raw?.type === 'income' || raw?.type === 'expense'
    ? raw.type
    : amount < 0 ? 'expense' : 'income';
  const dateValue = raw?.createdAt || raw?.created_at || raw?.date || raw?.timestamp || null;
  const date = dateValue ? new Date(dateValue) : null;

  return {
    id: raw?.id ?? raw?._id ?? `tx-${index}`,
    type,
    amount: Math.abs(amount),
    category: raw?.category || 'General',
    date: date && !Number.isNaN(date.getTime()) ? date : null,
  };
}

export function normalizeTransactions(list) {
  return Array.isArray(list) ? list.map(normalizeTransaction) : [];
}
