import * as SecureStore from 'expo-secure-store';

const INSIGHTS_SEEN_KEY = 'centauri_last_seen_insights';

// GET /ai/insights has no "is this new" flag — it's cached 6h server-side
// and always returns the current snapshot — so "new" is tracked locally by
// fingerprinting the content and comparing against the last one the user
// actually opened AI Coach to see.
function getFingerprint(data) {
  return JSON.stringify({
    insights: data?.insights || [],
    recommendations: data?.recommendations || [],
    warnings: data?.warnings || [],
  });
}

export async function hasNewInsights(data) {
  const hasAnyContent = Boolean(
    data?.insights?.length || data?.recommendations?.length || data?.warnings?.length
  );

  if (!hasAnyContent) {
    return false;
  }

  try {
    const stored = await SecureStore.getItemAsync(INSIGHTS_SEEN_KEY);
    return stored !== getFingerprint(data);
  } catch {
    return false;
  }
}

export async function markInsightsSeen(data) {
  try {
    await SecureStore.setItemAsync(INSIGHTS_SEEN_KEY, getFingerprint(data));
  } catch {
    // Best-effort only.
  }
}
