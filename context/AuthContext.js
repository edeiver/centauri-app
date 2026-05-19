import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { loginRequest, logoutRequest } from '../api';

const AuthContext = createContext({
  accessToken: null,
  expiresAt: null,
  user: null,
  initializing: false,
  loading: false,
  isAuthenticated: false,
  login: async () => {},
  logout: async () => {},
  setSession: () => {},
  getValidToken: () => null,
});

function decodeBase64Url(value) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let output = '';

  for (let index = 0; index < padded.length; index += 4) {
    const encoded1 = characters.indexOf(padded.charAt(index));
    const encoded2 = characters.indexOf(padded.charAt(index + 1));
    const encoded3 = characters.indexOf(padded.charAt(index + 2));
    const encoded4 = characters.indexOf(padded.charAt(index + 3));
    const byte1 = (encoded1 << 2) | (encoded2 >> 4);
    const byte2 = ((encoded2 & 15) << 4) | (encoded3 >> 2);
    const byte3 = ((encoded3 & 3) << 6) | encoded4;

    output += String.fromCharCode(byte1);

    if (encoded3 !== 64) {
      output += String.fromCharCode(byte2);
    }

    if (encoded4 !== 64) {
      output += String.fromCharCode(byte3);
    }
  }

  return decodeURIComponent(
    output
      .split('')
      .map((character) => `%${`00${character.charCodeAt(0).toString(16)}`.slice(-2)}`)
      .join('')
  );
}

function decodeJwtPayload(token) {
  const [, payload] = token.split('.');

  if (!payload) {
    throw new Error('El token recibido no es valido.');
  }

  try {
    return JSON.parse(decodeBase64Url(payload));
  } catch {
    throw new Error('El token recibido no es valido.');
  }
}

function getJwtExpiration(payload) {
  if (!payload.exp || typeof payload.exp !== 'number') {
    throw new Error('El token recibido no incluye expiracion.');
  }

  return payload.exp * 1000;
}

function isExpired(expiresAt) {
  return !expiresAt || Date.now() >= expiresAt;
}

function getUserFromPayload(payload) {
  return {
    id: payload.sub || payload.id || payload.userId || null,
    name: payload.name || payload.fullName || payload.email || 'Usuario',
    email: payload.email || '',
    roles: payload.roles || [],
  };
}

function getAccessTokenFromResponse(data) {
  return data?.accessToken || data?.token || data?.jwt || null;
}

function createSession(accessToken) {
  if (!accessToken) {
    throw new Error('El servidor no retorno un token.');
  }

  const payload = decodeJwtPayload(accessToken);
  const expiresAt = getJwtExpiration(payload);

  if (isExpired(expiresAt)) {
    throw new Error('La sesion recibida ya expiro.');
  }

  return {
    accessToken,
    expiresAt,
    user: getUserFromPayload(payload),
  };
}

export function AuthProvider({ children }) {
  const [session, setSessionState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initializing] = useState(false);

  const clearSession = useCallback(() => {
    setSessionState(null);
  }, []);

  const setSession = useCallback((accessToken) => {
    setSessionState(createSession(accessToken));
  }, []);

  const login = useCallback(async ({ email, password }) => {
    setLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();

      if (!cleanEmail || !password) {
        throw new Error('Ingresa tu correo y contrasena.');
      }

      const data = await loginRequest({ email: cleanEmail, password });
      setSession(getAccessTokenFromResponse(data));
    } finally {
      setLoading(false);
    }
  }, [setSession]);

  const logout = useCallback(async () => {
    const token = session?.accessToken;
    clearSession();

    try {
      await logoutRequest(token);
    } catch {
      // Local logout must win even if the backend logout endpoint fails.
    }
  }, [clearSession, session?.accessToken]);

  const getValidToken = useCallback(() => {
    if (!session?.accessToken || isExpired(session.expiresAt)) {
      clearSession();
      return null;
    }

    return session.accessToken;
  }, [clearSession, session]);

  useEffect(() => {
    if (!session?.expiresAt) {
      return undefined;
    }

    const timeout = setTimeout(clearSession, Math.max(session.expiresAt - Date.now(), 0));

    return () => clearTimeout(timeout);
  }, [clearSession, session?.expiresAt]);

  const value = useMemo(
    () => ({
      accessToken: session?.accessToken || null,
      expiresAt: session?.expiresAt || null,
      user: session?.user || null,
      initializing,
      loading,
      isAuthenticated: Boolean(session?.accessToken) && !isExpired(session?.expiresAt),
      login,
      logout,
      setSession,
      getValidToken,
    }),
    [getValidToken, initializing, loading, login, logout, session, setSession]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
