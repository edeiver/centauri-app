import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import * as SecureStore from 'expo-secure-store';
import { useTranslation } from 'react-i18next';

import { createBudgetRequest, getBudgetRequest } from '../api';
import { useAuth } from './AuthContext';

const LAST_BUDGET_KEY = 'centauri_last_budget';

const BudgetContext = createContext({
  budget: null,
  loading: true,
  showPrompt: false,
  hasNotification: false,
  dismissPrompt: () => {},
  openPrompt: () => {},
  createBudget: async () => {},
  refreshBudget: async () => {},
  acknowledgeCycleEnded: () => {},
});

async function readLastBudget() {
  try {
    const raw = await SecureStore.getItemAsync(LAST_BUDGET_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function writeLastBudget(value) {
  try {
    await SecureStore.setItemAsync(LAST_BUDGET_KEY, JSON.stringify(value));
  } catch {
    // Best-effort only.
  }
}

export function BudgetProvider({ children }) {
  const { t } = useTranslation();
  const { isAuthenticated, getValidToken } = useAuth();
  const [budget, setBudget] = useState(null);
  // Starts true (not false): showPrompt is gated on !loading, so if this
  // defaulted to false, isAuthenticated flipping true would make showPrompt
  // true for one render before the actual /budget fetch even started, then
  // false again once it did — that rapid true→false toggle of the Modal's
  // `visible` prop is what caused RN's native modal presentation to get
  // stuck mid-transition, silently blocking all touches (including the tab
  // bar) with nothing visibly on screen. Starting loading=true means
  // showPrompt can only ever become true after a real fetch has resolved.
  const [loading, setLoading] = useState(true);
  const [dismissedForSession, setDismissedForSession] = useState(false);
  // { endDate, acknowledged } for the most recent budget we've seen, kept
  // locally since GET /budget only ever returns the currently-active one —
  // once a cycle ends, the backend stops returning it, so this is the only
  // way to notice "a cycle just ended" instead of "there was never one".
  const [expiredNotice, setExpiredNotice] = useState(null);
  const wasAuthenticatedRef = useRef(false);

  const refreshBudget = useCallback(async () => {
    const token = getValidToken();

    if (!token) {
      setBudget(null);
      return;
    }

    setLoading(true);

    try {
      const data = await getBudgetRequest(token);

      if (data?.id) {
        setBudget(data);
        setExpiredNotice(null);

        const stored = await readLastBudget();
        if (stored?.id !== data.id) {
          await writeLastBudget({ id: data.id, endDate: data.end_date, acknowledged: false });
        }
      } else {
        setBudget(null);

        const stored = await readLastBudget();
        if (stored?.endDate && !stored.acknowledged && new Date(stored.endDate).getTime() <= Date.now()) {
          setExpiredNotice(stored);
        } else {
          setExpiredNotice(null);
        }
      }
    } catch {
      setBudget(null);
    } finally {
      setLoading(false);
    }
  }, [getValidToken]);

  useEffect(() => {
    const wasAuthenticated = wasAuthenticatedRef.current;
    wasAuthenticatedRef.current = isAuthenticated;

    if (isAuthenticated && !wasAuthenticated) {
      // Fresh login/session restore — reset this session's dismissal so
      // the prompt can reappear if there's still no active budget.
      setDismissedForSession(false);
    }

    if (isAuthenticated) {
      refreshBudget();
    } else {
      setBudget(null);
      setExpiredNotice(null);
    }
  }, [isAuthenticated, refreshBudget]);

  const dismissPrompt = useCallback(() => {
    setDismissedForSession(true);
  }, []);

  // Lets any screen (e.g. an AI Coach CTA) re-open the budget prompt even
  // after the user dismissed it for this session — only has an effect when
  // there's genuinely no active budget; showPrompt still requires !budget.
  const openPrompt = useCallback(() => {
    setDismissedForSession(false);
  }, []);

  const acknowledgeCycleEnded = useCallback(() => {
    setExpiredNotice(null);

    (async () => {
      const stored = await readLastBudget();
      if (stored) {
        await writeLastBudget({ ...stored, acknowledged: true });
      }
    })();
  }, []);

  const createBudget = useCallback(async ({ amount, days }) => {
    const token = getValidToken();

    if (!token) {
      throw new Error(t('budget.sessionExpired'));
    }

    const created = await createBudgetRequest({ amount, days }, token);
    setBudget(created);
    setExpiredNotice(null);
    setDismissedForSession(false);
    await writeLastBudget({ id: created.id, endDate: created.end_date, acknowledged: false });

    return created;
  }, [getValidToken, t]);

  const showPrompt = isAuthenticated && !loading && !budget && !dismissedForSession;
  const hasNotification = Boolean(expiredNotice);

  const value = useMemo(
    () => ({
      budget,
      loading,
      showPrompt,
      hasNotification,
      dismissPrompt,
      openPrompt,
      createBudget,
      refreshBudget,
      acknowledgeCycleEnded,
    }),
    [budget, loading, showPrompt, hasNotification, dismissPrompt, openPrompt, createBudget, refreshBudget, acknowledgeCycleEnded]
  );

  return (
    <BudgetContext.Provider value={value}>
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudget() {
  return useContext(BudgetContext);
}
