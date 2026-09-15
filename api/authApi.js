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

// Assumed body shape for POST /auth/register — {name, email, password} —
// mirroring loginRequest's {email, password}. Not confirmed against the
// backend controller; adjust the key names here if register expects
// something else (e.g. fullName).
export async function registerRequest({ name, email, password }) {
  const response = await fetch(endpoints.auth.register, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email, password }),
  });
  const data = await parseJsonResponse(response);

  if (!response.ok) {
    throw new Error(data?.message || 'No se pudo crear la cuenta.');
  }

  return data;
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
