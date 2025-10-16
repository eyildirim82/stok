import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService, tokenManager, userManager } from '../services/api';
import { User } from '../types';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for token on initial load
    const token = localStorage.getItem('authToken');
    if (token) {
      // In a real app, you'd validate the token with the server
      // For this mock, we'll just assume it's valid and set a mock user
      setUser({ id: 'user-1', email: 'admin@example.com', name: 'Admin User' });
    }
    setLoading(false);
  }, []);
  
  const login = async (email: string, password: string) => {
    // Backend, kullanıcı adı alanı bekliyor; e-postayı username olarak geçiriyoruz
    const response = await apiService.auth.login({ username: email, password });

    if (response?.success && response?.data?.token && response?.data?.user) {
      tokenManager.setToken(response.data.token);
      userManager.setUser(response.data.user);
      setUser(response.data.user);
      navigate('/dashboard');
      return;
    }

    throw new Error('Giriş başarısız.');
  };

  const logout = () => {
    // Sunucu tarafı oturum kapatma çağrısı (isteğe bağlı)
    try { void apiService.auth.logout(); } catch {}
    tokenManager.removeToken();
    userManager.removeUser();
    setUser(null);
    navigate('/login');
  };

  const value = {
    isAuthenticated: !!user,
    user,
    login,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};