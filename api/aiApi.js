import { endpoints } from './endpoints';
import { apiRequest } from './httpClient';

export async function getInsightsRequest(accessToken, lang) {
  const url = lang ? `${endpoints.aiInsights}?lang=${encodeURIComponent(lang)}` : endpoints.aiInsights;
  const data = await apiRequest(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  return {
    insights: data?.insights || [],
    recommendations: data?.recommendations || [],
    warnings: data?.warnings || [],
  };
}
