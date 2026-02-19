'use client';

import { useState, useEffect, useCallback } from 'react';
import { getToken, storeToken, removeToken, isAuthenticated as checkAuth } from '@/lib/auth';
import type { AuthState } from '@/types';

/**
 * Hook for managing authentication state.
 * Reads/writes JWT from localStorage via lib/auth helpers.
 */
export function useAuth(): AuthState & {
  login: (token: string) => void;
  logout: () => void;
} {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    token: null,
    userId: null,
    firstName: null,
    lastName: null,
  });

  useEffect(() => {
    const token = getToken();
    setState({
      isAuthenticated: checkAuth(),
      token,
      userId: null,
      firstName: null,
      lastName: null,
    });
  }, []);

  const login = useCallback((token: string) => {
    storeToken(token);
    setState({
      isAuthenticated: true,
      token,
      userId: null,
      firstName: null,
      lastName: null,
    });
  }, []);

  const logout = useCallback(() => {
    removeToken();
    setState({
      isAuthenticated: false,
      token: null,
      userId: null,
      firstName: null,
      lastName: null,
    });
  }, []);

  return { ...state, login, logout };
}
