const LOCAL_API_URL = 'http://localhost:3000';
const PRODUCTION_API_URL = 'https://centauri-ai-backend.onrender.com';

// EXPO_PUBLIC_* env vars are inlined by Expo at build time, so this can be
// overridden per-environment (e.g. via .env / eas.json) without editing code.
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL
  || (__DEV__ ? LOCAL_API_URL : PRODUCTION_API_URL);

export const endpoints = {
  auth: {
    register: `${API_BASE_URL}/auth/register`,
    login: `${API_BASE_URL}/auth/login`,
    refresh: `${API_BASE_URL}/auth/refresh`,
    logout: `${API_BASE_URL}/auth/logout`,
  },
  transactions: `${API_BASE_URL}/transactions`,
  aiInsights: `${API_BASE_URL}/ai/insights`,
  budget: `${API_BASE_URL}/budget`,
};
