import { endpoints } from './endpoints';
import { apiRequest } from './httpClient';

export async function getTransactionsRequest(accessToken) {
  return apiRequest(endpoints.transactions, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });
}

export async function createTransactionRequest({ type, amount, category }, accessToken) {
  return apiRequest(endpoints.transactions, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ type, amount, category }),
  });
}
