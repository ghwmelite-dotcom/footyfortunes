/**
 * Authentication Context
 * Manages user authentication state and provides auth methods
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, TokenManager } from '../services/api';
import type { User, LoginCredentials, RegisterData } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🚀 DEV MODE: Auto-login for testing
  const DEV_MODE = false; // Backend is now working!

  /**
   * Load current user on mount if tokens exist
   */
  useEffect(() => {
    const loadUser = async () => {
      // DEV MODE: Auto-login with mock user
      if (DEV_MODE) {
        console.log('🚀 DEV MODE: Auto-logging in with mock user');
        const mockUser: User = {
          id: 'dev-user-1',
          email: 'test@test.com',
          username: 'testuser',
          fullName: 'Test User',
          role: 'admin',
          status: 'active',
          createdAt: new Date().toISOString(),
        };
        setUser(mockUser);
        setIsLoading(false);
        return;
      }

      if (TokenManager.hasTokens()) {
        try {
          const response = await authApi.getCurrentUser();
          if (response.success && response.user) {
            setUser(response.user);
          } else {
            // Invalid token, clear storage
            TokenManager.clearTokens();
          }
        } catch (err) {
          console.error('Failed to load user:', err);
          TokenManager.clearTokens();
        }
      }
      setIsLoading(false);
    };

    loadUser();
  }, []);

  /**
   * Login user
   */
  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    // DEV MODE: Always succeed with mock user
    if (DEV_MODE) {
      console.log('🚀 DEV MODE: Login bypassed, using mock user');
      const mockUser: User = {
        id: 'dev-user-1',
        email: credentials.email,
        username: 'testuser',
        fullName: 'Test User',
        role: 'admin',
        status: 'active',
        createdAt: new Date().toISOString(),
      };
      setUser(mockUser);
      setIsLoading(false);
      return true;
    }

    try {
      const response = await authApi.login(credentials);

      if (response.success && response.user) {
        setUser(response.user);
        setIsLoading(false);
        return true;
      } else {
        setError(response.error || 'Login failed');
        setIsLoading(false);
        return false;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      setIsLoading(false);
      return false;
    }
  }, []);

  /**
   * Register new user
   */
  const register = useCallback(async (data: RegisterData): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    // DEV MODE: Always succeed with mock user
    if (DEV_MODE) {
      console.log('🚀 DEV MODE: Registration bypassed, using mock user');
      const mockUser: User = {
        id: 'dev-user-1',
        email: data.email,
        username: data.username,
        fullName: data.fullName,
        role: 'admin',
        status: 'active',
        createdAt: new Date().toISOString(),
      };
      setUser(mockUser);
      setIsLoading(false);
      return true;
    }

    try {
      const response = await authApi.register(data);

      if (response.success && response.user) {
        setUser(response.user);
        setIsLoading(false);
        return true;
      } else {
        setError(response.error || 'Registration failed');
        setIsLoading(false);
        return false;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
      setIsLoading(false);
      return false;
    }
  }, []);

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      TokenManager.clearTokens();
      setIsLoading(false);
    }
  }, []);

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to use auth context
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
