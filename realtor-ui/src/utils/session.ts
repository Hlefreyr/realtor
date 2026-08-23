import { UserAuthData } from '../components/LoginModal';

export interface StoredSession {
  user: UserAuthData;
  expiresAt: number | null;
  staySignedIn: boolean;
}

export const SESSION_STORAGE_KEY = 'realtor_auth_session';
export const DEFAULT_TIMEOUT_MS = 20 * 60 * 1000; // 20 minutes

export const saveSession = (user: UserAuthData, staySignedIn: boolean): StoredSession => {
  const expiresAt = staySignedIn ? null : Date.now() + DEFAULT_TIMEOUT_MS;
  const session: StoredSession = {
    user,
    expiresAt,
    staySignedIn,
  };

  if (typeof window !== 'undefined') {
    try {
      if (staySignedIn) {
        window.sessionStorage?.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
        window.localStorage?.removeItem(SESSION_STORAGE_KEY);
      } else {
        window.localStorage?.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
        window.sessionStorage?.removeItem(SESSION_STORAGE_KEY);
      }
    } catch (err) {
      console.error('Failed to save session:', err);
    }
  }

  return session;
};

export const getSession = (): UserAuthData | null => {
  if (typeof window === 'undefined') return null;

  try {
    const rawSession =
      window.sessionStorage?.getItem(SESSION_STORAGE_KEY) ||
      window.localStorage?.getItem(SESSION_STORAGE_KEY);

    if (!rawSession) return null;

    const session: StoredSession = JSON.parse(rawSession);

    if (session.staySignedIn) {
      return session.user;
    }

    if (session.expiresAt && Date.now() < session.expiresAt) {
      return session.user;
    }

    clearSession();
    return null;
  } catch (err) {
    clearSession();
    return null;
  }
};

export const clearSession = (): void => {
  if (typeof window !== 'undefined') {
    try {
      window.sessionStorage?.removeItem(SESSION_STORAGE_KEY);
      window.localStorage?.removeItem(SESSION_STORAGE_KEY);
    } catch (err) {
      console.error('Failed to clear session:', err);
    }
  }
};

export const PREF_STAY_SIGNED_IN_KEY = 'realtor_pref_stay_signed_in';

export const getSavedStaySignedInPref = (): boolean => {
  if (typeof window === 'undefined') return true;
  try {
    const val = window.localStorage?.getItem(PREF_STAY_SIGNED_IN_KEY);
    if (val === 'false') return false;
    return true;
  } catch (err) {
    return true;
  }
};

export const saveStaySignedInPref = (staySignedIn: boolean): void => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage?.setItem(PREF_STAY_SIGNED_IN_KEY, String(staySignedIn));
  } catch (err) {
    console.error('Failed to save stay signed in preference:', err);
  }
};

