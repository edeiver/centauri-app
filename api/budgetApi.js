import { endpoints } from './endpoints';
import { apiRequest } from './httpClient';

// GET /budget returns the user's active budget (end_date in the future) or
// null if they don't have one — see centauri-ai-backend's
// budget.controller.js.
export async function getBudgetRequest(accessToken) {
  return apiRequest(endpoints.budget, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });
}

export async function createBudgetRequest({ amount, days }, accessToken) {
  return apiRequest(endpoints.budget, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ amount, days }),
  });
}
