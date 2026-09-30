import React, { createContext, useEffect, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService, tokenManager, userManager } from '../services/api';
import { User } from '../types';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      const token = tokenManager.getToken();
      if (!token) {
        if (!cancelled) setLoading(false);
        return;
      }

      try {
        const response = await apiService.auth.getMe();
        if (cancelled) return;

        userManager.setUser(response.data.user);
        setUser(response.data.user);
      } catch {
        tokenManager.removeToken();
        userManager.removeUser();
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (username: string, password: string) => {
    const response = await apiService.auth.login({ username, password });

    if (!response.success || !response.data?.token || !response.data?.user) {
      throw new Error('Giriş başarısız.');
    }

    tokenManager.setToken(response.data.token);
    userManager.setUser(response.data.user);
    setUser(response.data.user);
    navigate('/dashboard');
  };

  const logout = () => {
    void apiService.auth.logout().catch(() => undefined);
    tokenManager.removeToken();
    userManager.removeUser();
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: Boolean(user),
        user,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
