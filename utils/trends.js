// Month-over-month expense comparison, computed entirely from the
// transaction list already fetched for the Dashboard — no backend change
// needed. Returns null when there's no previous-month data to compare
// against (first month of usage), since a "% change" against zero is
// meaningless rather than informative.
export function getExpenseTrend(transactions) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const previousMonthDate = new Date(currentYear, currentMonth - 1, 1);
  const previousMonth = previousMonthDate.getMonth();
  const previousYear = previousMonthDate.getFullYear();

  let current = 0;
  let previous = 0;

  transactions.forEach((tx) => {
    if (tx.type !== 'expense' || !tx.date) {
      return;
    }

    const txYear = tx.date.getFullYear();
    const txMonth = tx.date.getMonth();

    if (txYear === currentYear && txMonth === currentMonth) {
      current += tx.amount;
    } else if (txYear === previousYear && txMonth === previousMonth) {
      previous += tx.amount;
    }
  });

  if (previous <= 0) {
    return null;
  }

  const rawPct = ((current - previous) / previous) * 100;
  const pct = Math.round(Math.abs(rawPct));
  const direction = rawPct > 0.5 ? 'up' : rawPct < -0.5 ? 'down' : 'flat';

  return { pct, direction, current, previous };
}
