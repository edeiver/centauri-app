export const API_BASE_URL = 'https://api.centauri.local';

export const endpoints = {
  auth: {
    login: `${API_BASE_URL}/auth/login`,
    me: `${API_BASE_URL}/auth/me`,
    refresh: `${API_BASE_URL}/auth/refresh`,
    logout: `${API_BASE_URL}/auth/logout`,
  },
};
