'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginInput, RegisterInput, AuthResponse, ApiResponse } from '@/lib/types';
import api, { setupResponseInterceptor } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginInput) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize response interceptor on client-side only
  useEffect(() => {
    setupResponseInterceptor();
  }, []);

  // Check for existing auth on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
        setIsLoading(false);
        return;
      }
      const token = window.localStorage.getItem('accessToken');
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await api.get<ApiResponse<{ user: User }>>('/auth/me');
      setUser(response.data.data.user);
    } catch {
      if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
        window.localStorage.removeItem('accessToken');
      }
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (data: LoginInput) => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', data);
    const { user, accessToken } = response.data.data;
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      window.localStorage.setItem('accessToken', accessToken);
    }
    setUser(user);
  };

  const register = async (data: RegisterInput) => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
    const { user, accessToken } = response.data.data;
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      window.localStorage.setItem('accessToken', accessToken);
    }
    setUser(user);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore logout errors
    } finally {
      if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
        window.localStorage.removeItem('accessToken');
      }
      setUser(null);
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
