import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import * as SecureStore from 'expo-secure-store';

import i18n from '../i18n';
import { loginRequest, logoutRequest, refreshRequest, registerRequest } from '../api';

const REFRESH_TOKEN_KEY = 'centauri_refresh_token';

// Refresh a bit before the access token actually expires (it lives 15
// minutes server-side) so a silent renewal always beats the deadline.
const REFRESH_MARGIN_MS = 60 * 1000;

const AuthContext = createContext({
  accessToken: null,
  expiresAt: null,
  user: null,
  initializing: true,
  loading: false,
  isAuthenticated: false,
  login: async () => {},
  register: async () => {},
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
    throw new Error(i18n.t('auth.invalidToken'));
  }

  try {
    return JSON.parse(decodeBase64Url(payload));
  } catch {
    throw new Error(i18n.t('auth.invalidToken'));
  }
}

function getJwtExpiration(payload) {
  if (!payload.exp || typeof payload.exp !== 'number') {
    throw new Error(i18n.t('auth.noExpiration'));
  }

  return payload.exp * 1000;
}

function isExpired(expiresAt) {
  return !expiresAt || Date.now() >= expiresAt;
}

// The access token JWT only carries { userId, username } (see
// centauri-ai-backend's auth.controller.js) — no email/name/roles claims.
function getUserFromPayload(payload) {
  return {
    id: payload.sub || payload.id || payload.userId || null,
    username: payload.username || '',
    name: payload.name || payload.fullName || payload.username || payload.email || 'Usuario',
    email: payload.email || '',
    roles: payload.roles || [],
  };
}

function getTokensFromResponse(data) {
  return {
    accessToken: data?.accessToken || data?.token || data?.jwt || null,
    refreshToken: data?.refreshToken || null,
  };
}

function createSession(accessToken, refreshToken) {
  if (!accessToken) {
    throw new Error(i18n.t('auth.noToken'));
  }

  const payload = decodeJwtPayload(accessToken);
  const expiresAt = getJwtExpiration(payload);

  if (isExpired(expiresAt)) {
    throw new Error(i18n.t('auth.sessionExpiredOnLogin'));
  }

  return {
    accessToken,
    refreshToken: refreshToken || null,
    expiresAt,
    user: getUserFromPayload(payload),
  };
}

export function AuthProvider({ children }) {
  const [session, setSessionState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  const clearSession = useCallback(() => {
    setSessionState(null);
  }, []);

  // Persistence is best-effort: if SecureStore throws (e.g. unavailable in
  // some environment), the in-memory session still works for this run, it
  // just won't survive a reload.
  const persistRefreshToken = useCallback(async (refreshToken) => {
    try {
      if (refreshToken) {
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
      } else {
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      }
    } catch {
      // Ignored — see comment above.
    }
  }, []);

  const setSession = useCallback((accessToken, refreshToken) => {
    setSessionState(createSession(accessToken, refreshToken));
  }, []);

  const login = useCallback(async ({ username, password, remember = true }) => {
    setLoading(true);

    try {
      const cleanUsername = username.trim();

      if (!cleanUsername || !password) {
        throw new Error(i18n.t('auth.loginRequired'));
      }

      const data = await loginRequest({ username: cleanUsername, password });
      const tokens = getTokensFromResponse(data);
      setSession(tokens.accessToken, tokens.refreshToken);
      await persistRefreshToken(remember ? tokens.refreshToken : null);
    } finally {
      setLoading(false);
    }
  }, [persistRefreshToken, setSession]);

  const register = useCallback(async ({ username, email, password }) => {
    setLoading(true);

    try {
      const cleanUsername = username.trim();
      const cleanEmail = email.trim().toLowerCase();

      if (!cleanUsername || !cleanEmail || !password) {
        throw new Error(i18n.t('auth.registerRequired'));
      }

      await registerRequest({ username: cleanUsername, email: cleanEmail, password });

      // POST /auth/register only creates the account and never returns a
      // token, so log in right after with the same credentials to land the
      // user inside the app instead of back on Auth.
      const data = await loginRequest({ username: cleanUsername, password });
      const tokens = getTokensFromResponse(data);
      setSession(tokens.accessToken, tokens.refreshToken);
      await persistRefreshToken(tokens.refreshToken);
    } finally {
      setLoading(false);
    }
  }, [persistRefreshToken, setSession]);

  const logout = useCallback(async () => {
    const refreshToken = session?.refreshToken;
    clearSession();
    await persistRefreshToken(null);

    try {
      await logoutRequest(refreshToken);
    } catch {
      // Local logout must win even if the backend logout endpoint fails.
    }
  }, [clearSession, persistRefreshToken, session?.refreshToken]);

  const getValidToken = useCallback(() => {
    if (!session?.accessToken || isExpired(session.expiresAt)) {
      clearSession();
      return null;
    }

    return session.accessToken;
  }, [clearSession, session]);

  // On mount, try to silently restore a session from a persisted refresh
  // token (e.g. after a JS reload or a real app relaunch) instead of always
  // starting logged out.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      let storedRefreshToken = null;

      try {
        storedRefreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      } catch {
        storedRefreshToken = null;
      }

      if (!storedRefreshToken) {
        if (!cancelled) {
          setInitializing(false);
        }
        return;
      }

      try {
        const data = await refreshRequest(storedRefreshToken);
        const tokens = getTokensFromResponse(data);

        if (!cancelled) {
          setSession(tokens.accessToken, tokens.refreshToken);
          await persistRefreshToken(tokens.refreshToken);
        }
      } catch {
        await persistRefreshToken(null);
      } finally {
        if (!cancelled) {
          setInitializing(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // Restoration only ever runs once, on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Silently renews the access token in the background so a 15-minute
  // expiry doesn't force a re-login mid-session; falls back to logging out
  // only if the refresh token itself is missing or rejected.
  useEffect(() => {
    if (!session?.expiresAt) {
      return undefined;
    }

    const delay = Math.max(session.expiresAt - REFRESH_MARGIN_MS - Date.now(), 0);

    const timeout = setTimeout(async () => {
      if (!session.refreshToken) {
        clearSession();
        return;
      }

      try {
        const data = await refreshRequest(session.refreshToken);
        const tokens = getTokensFromResponse(data);
        const nextRefreshToken = tokens.refreshToken || session.refreshToken;
        setSession(tokens.accessToken, nextRefreshToken);
        await persistRefreshToken(nextRefreshToken);
      } catch {
        clearSession();
        await persistRefreshToken(null);
      }
    }, delay);

    return () => clearTimeout(timeout);
  }, [clearSession, persistRefreshToken, session, setSession]);

  const value = useMemo(
    () => ({
      accessToken: session?.accessToken || null,
      expiresAt: session?.expiresAt || null,
      user: session?.user || null,
      initializing,
      loading,
      isAuthenticated: Boolean(session?.accessToken) && !isExpired(session?.expiresAt),
      login,
      register,
      logout,
      setSession,
      getValidToken,
    }),
    [getValidToken, initializing, loading, login, logout, register, session, setSession]
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
