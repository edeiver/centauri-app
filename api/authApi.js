import { endpoints } from './endpoints';

async function parseJsonResponse(response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error('La respuesta del servidor no es valida.');
  }
}

export async function loginRequest({ email, password }) {
  const response = await fetch(endpoints.auth.login, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  const data = await parseJsonResponse(response);

  if (!response.ok) {
    throw new Error(data?.message || 'No se pudo iniciar sesion.');
  }

  return data;
}

export async function logoutRequest(accessToken) {
  if (!accessToken) {
    return;
  }

  await fetch(endpoints.auth.logout, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });
}
