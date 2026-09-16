import { endpoints } from './endpoints';
import { apiRequest } from './httpClient';

export async function registerRequest({ username, email, password }) {
  return apiRequest(endpoints.auth.register, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, email, password }),
  });
}

export async function loginRequest({ username, password }) {
  return apiRequest(endpoints.auth.login, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });
}

export async function refreshRequest(refreshToken) {
  return apiRequest(endpoints.auth.refresh, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  });
}

export async function logoutRequest(refreshToken) {
  if (!refreshToken) {
    return;
  }

  await apiRequest(endpoints.auth.logout, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  });
}
