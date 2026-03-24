'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  expiresAt: number | null;
}

interface AuthContextType extends AuthState {
  login: () => void;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    expiresAt: null,
  });

  // Check auth status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Set up auto-refresh before token expires
  useEffect(() => {
    if (!state.isAuthenticated || !state.expiresAt) return;

    // Refresh 5 minutes before expiry
    const refreshTime = state.expiresAt - Date.now() - 5 * 60 * 1000;

    if (refreshTime <= 0) {
      // Token already expired or about to, refresh now
      refreshToken();
      return;
    }

    const timeout = setTimeout(() => {
      refreshToken();
    }, refreshTime);

    return () => clearTimeout(timeout);
  }, [state.isAuthenticated, state.expiresAt]);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/status');
      const data = await response.json();

      setState({
        isAuthenticated: data.authenticated,
        isLoading: false,
        expiresAt: data.expires_at,
      });
    } catch (err) {
      console.error('Auth status check failed:', err);
      setState({
        isAuthenticated: false,
        isLoading: false,
        expiresAt: null,
      });
    }
  };

  const login = useCallback(() => {
    window.location.href = '/api/auth/login';
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setState({
        isAuthenticated: false,
        isLoading: false,
        expiresAt: null,
      });
    } catch (err) {
      console.error('Logout failed:', err);
    }
  }, []);

  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/refresh', { method: 'POST' });

      if (!response.ok) {
        setState((prev) => ({ ...prev, isAuthenticated: false, expiresAt: null }));
        return false;
      }

      const data = await response.json();
      setState((prev) => ({
        ...prev,
        isAuthenticated: true,
        expiresAt: data.expires_at,
      }));

      return true;
    } catch (err) {
      console.error('Token refresh failed:', err);
      setState((prev) => ({ ...prev, isAuthenticated: false, expiresAt: null }));
      return false;
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
