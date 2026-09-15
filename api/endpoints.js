export const API_BASE_URL = 'http://localhost:3000';

export const endpoints = {
  auth: {
    register: `${API_BASE_URL}/auth/register`,
    login: `${API_BASE_URL}/auth/login`,
    refresh: `${API_BASE_URL}/auth/refresh`,
    logout: `${API_BASE_URL}/auth/logout`,
  },
  transactions: `${API_BASE_URL}/transactions`,
  aiInsights: `${API_BASE_URL}/ai/insights`,
};
