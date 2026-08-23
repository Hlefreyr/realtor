import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import App from '../../App';
import * as sessionUtil from '../../src/utils/session';

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

describe('App Root UI Test', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    jest.restoreAllMocks();
  });

  it('renders landing hero when no active session exists', () => {
    jest.spyOn(sessionUtil, 'getSession').mockReturnValue(null);
    const { getByTestId } = render(<App />);
    expect(getByTestId('app-root')).toBeTruthy();
  });

  it('restores user dashboard session automatically on mount when stored session exists', () => {
    const mockUser = {
      id: 'admin-id-123',
      email: 'admin@realtor.com',
      role: 'admin' as const,
      token: 'mock-token-admin-123',
    };
    jest.spyOn(sessionUtil, 'getSession').mockReturnValue(mockUser);

    const { getByTestId } = render(<App />);
    expect(getByTestId('dashboard-layout-container')).toBeTruthy();
  });

  it('clears session when user logs out', () => {
    const mockUser = {
      id: 'user-id-456',
      email: 'user@realtor.com',
      role: 'user' as const,
      token: 'mock-token-user-123',
    };
    jest.spyOn(sessionUtil, 'getSession').mockReturnValue(mockUser);
    const clearSessionSpy = jest.spyOn(sessionUtil, 'clearSession');

    const { getByTestId } = render(<App />);
    expect(getByTestId('dashboard-layout-container')).toBeTruthy();

    const logoutButton = getByTestId('logout-button');
    fireEvent.press(logoutButton);

    expect(clearSessionSpy).toHaveBeenCalled();
  });
});
