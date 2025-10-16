import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService, tokenManager, userManager, apiStatus } from '../services/api';

interface ApiContextType {
  // API durumu
  isApiHealthy: boolean;
  isDatabaseConnected: boolean;
  
  // Kullanıcı durumu
  isLoggedIn: boolean;
  user: any | null;
  
  // API fonksiyonları
  auth: typeof apiService.auth;
  products: typeof apiService.products;
  stockMovements: typeof apiService.stockMovements;
  health: typeof apiService.health;
  
  // Utility fonksiyonları
  login: (credentials: any) => Promise<any>;
  logout: () => void;
  checkApiStatus: () => Promise<void>;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

export const useApiContext = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApiContext must be used within an ApiProvider');
  }
  return context;
};

interface ApiProviderProps {
  children: React.ReactNode;
}

export const ApiProvider: React.FC<ApiProviderProps> = ({ children }) => {
  const [isApiHealthy, setIsApiHealthy] = useState(false);
  const [isDatabaseConnected, setIsDatabaseConnected] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any | null>(null);

  // API durumunu kontrol et
  const checkApiStatus = async () => {
    try {
      const [apiHealthy, dbConnected] = await Promise.all([
        apiStatus.check(),
        apiStatus.checkDatabase()
      ]);
      
      setIsApiHealthy(apiHealthy);
      setIsDatabaseConnected(dbConnected);
    } catch (error) {
      console.error('API status check failed:', error);
      setIsApiHealthy(false);
      setIsDatabaseConnected(false);
    }
  };

  // Kullanıcı durumunu kontrol et
  const checkUserStatus = () => {
    const loggedIn = userManager.isLoggedIn();
    const userData = userManager.getUser();
    
    setIsLoggedIn(loggedIn);
    setUser(userData);
  };

  // Login fonksiyonu
  const login = async (credentials: any) => {
    try {
      const response = await apiService.auth.login(credentials);
      
      if (response.success) {
        // Token'ı kaydet
        tokenManager.setToken(response.data.token);
        userManager.setUser(response.data.user);
        
        // State'i güncelle
        setIsLoggedIn(true);
        setUser(response.data.user);
        
        return response;
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  // Logout fonksiyonu
  const logout = () => {
    // Token ve kullanıcı bilgilerini temizle
    tokenManager.removeToken();
    userManager.removeUser();
    
    // State'i güncelle
    setIsLoggedIn(false);
    setUser(null);
  };

  // Component mount olduğunda durumu kontrol et
  useEffect(() => {
    checkApiStatus();
    checkUserStatus();
  }, []);

  // Periyodik API durumu kontrolü
  useEffect(() => {
    const interval = setInterval(checkApiStatus, 30000); // 30 saniyede bir
    return () => clearInterval(interval);
  }, []);

  const contextValue: ApiContextType = {
    // API durumu
    isApiHealthy,
    isDatabaseConnected,
    
    // Kullanıcı durumu
    isLoggedIn,
    user,
    
    // API fonksiyonları
    auth: apiService.auth,
    products: apiService.products,
    stockMovements: apiService.stockMovements,
    health: apiService.health,
    
    // Utility fonksiyonları
    login,
    logout,
    checkApiStatus,
  };

  return (
    <ApiContext.Provider value={contextValue}>
      {children}
    </ApiContext.Provider>
  );
};
