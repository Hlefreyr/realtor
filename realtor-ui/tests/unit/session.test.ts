import {
  saveSession,
  getSession,
  clearSession,
  SESSION_STORAGE_KEY,
  DEFAULT_TIMEOUT_MS,
} from '../../src/utils/session';
import { UserAuthData } from '../../src/components/LoginModal';

const createStorageMock = () => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
};

const mockLocalStorage = createStorageMock();
const mockSessionStorage = createStorageMock();

Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

Object.defineProperty(global, 'sessionStorage', {
  value: mockSessionStorage,
  writable: true,
});

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
  });
  Object.defineProperty(window, 'sessionStorage', {
    value: mockSessionStorage,
    writable: true,
  });
}

describe('Session Persistence Utility Unit Tests', () => {
  const mockUser: UserAuthData = {
    id: 'user-id-456',
    email: 'user@realtor.com',
    role: 'user',
    token: 'mock-token-user-123',
  };

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    jest.restoreAllMocks();
  });

  it('should save session to localStorage with 20-minute expiration when staySignedIn is false', () => {
    const startTime = 1000000;
    jest.spyOn(Date, 'now').mockReturnValue(startTime);

    const session = saveSession(mockUser, false);

    expect(session.staySignedIn).toBe(false);
    expect(session.expiresAt).toBe(startTime + DEFAULT_TIMEOUT_MS);
    expect(localStorage.getItem(SESSION_STORAGE_KEY)).toBeTruthy();
    expect(sessionStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();
  });

  it('should save session to sessionStorage without expiration when staySignedIn is true', () => {
    const session = saveSession(mockUser, true);

    expect(session.staySignedIn).toBe(true);
    expect(session.expiresAt).toBeNull();
    expect(sessionStorage.getItem(SESSION_STORAGE_KEY)).toBeTruthy();
    expect(localStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();
  });

  it('should retrieve active session from localStorage when not expired', () => {
    saveSession(mockUser, false);
    const retrievedUser = getSession();
    expect(retrievedUser).toEqual(mockUser);
  });

  it('should retrieve active session from sessionStorage when staySignedIn is true', () => {
    saveSession(mockUser, true);
    const retrievedUser = getSession();
    expect(retrievedUser).toEqual(mockUser);
  });

  it('should clear storage and return null when 20-minute default session has expired', () => {
    const startTime = 1000000;
    jest.spyOn(Date, 'now').mockReturnValue(startTime);
    saveSession(mockUser, false);

    // Advance time beyond 20 minutes
    jest.spyOn(Date, 'now').mockReturnValue(startTime + DEFAULT_TIMEOUT_MS + 1000);

    const retrievedUser = getSession();
    expect(retrievedUser).toBeNull();
    expect(localStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();
  });

  it('should clear session from both localStorage and sessionStorage on clearSession', () => {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ user: mockUser }));
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ user: mockUser }));

    clearSession();

    expect(localStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();
    expect(sessionStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();
  });

  it('should return null and clear storage when stored session string is corrupted', () => {
    localStorage.setItem(SESSION_STORAGE_KEY, 'invalid-json-{');
    const result = getSession();
    expect(result).toBeNull();
    expect(localStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();
  });
});
