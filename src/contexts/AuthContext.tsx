import React, { useCallback, useState, useEffect } from 'react';
import {
  getCurrentUser,
  loginRequest,
  logoutRequest,
  type AuthUser,
} from '../services/authApi';
import { AuthContext } from './authContextValue';
import { ApiError, setUnauthorizedHandler } from '../lib/api';

const USER_STORAGE_KEY = 'admin_user';
const TOKEN_STORAGE_KEY = 'admin_token';

const storedUser = (): AuthUser | null => {
  const savedUser = localStorage.getItem(USER_STORAGE_KEY);

  if (!savedUser) {
    return null;
  }

  try {
    return JSON.parse(savedUser) as AuthUser;
  } catch {
    localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearSession = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  }, []);

  useEffect(() => setUnauthorizedHandler(clearSession), [clearSession]);

  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_STORAGE_KEY);

    if (!savedToken) {
      setIsLoading(false);
      return;
    }

    setToken(savedToken);
    setUser(storedUser());

    getCurrentUser(savedToken)
      .then((currentUser) => {
        setUser(currentUser);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(currentUser));
      })
      .catch((saveError: unknown) => {
        if (saveError instanceof ApiError && saveError.status === 401) {
          clearSession();
        }
      })
      .finally(() => setIsLoading(false));
  }, [clearSession]);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const auth = await loginRequest(username, password);

      setUser(auth.user);
      setToken(auth.token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(auth.user));
      localStorage.setItem(TOKEN_STORAGE_KEY, auth.token);

      return true;
    } catch (loginError: unknown) {
      if (loginError instanceof ApiError && loginError.status === 401) {
        return false;
      }

      throw loginError;
    }
    return false;
  };

  const logout = () => {
    const currentToken = token;

    clearSession();

    if (currentToken) {
      void logoutRequest(currentToken);
    }
  };

  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!user && !!token,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
