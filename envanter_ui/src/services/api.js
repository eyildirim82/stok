import axios from 'axios';
import { storage } from '../utils/index.ts';

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Axios instance oluştur
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - JWT token'ını otomatik ekle
api.interceptors.request.use(
  (config) => {
    // Local storage'dan token'ı al
    const token = storage.get('authToken');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Hata yönetimi
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 401 Unauthorized - Token geçersiz veya süresi dolmuş
    if (error.response?.status === 401) {
      // Token'ı temizle
      storage.remove('authToken');
      storage.remove('user');
      
      // Login sayfasına yönlendir (eğer window mevcutsa)
      if (typeof window !== 'undefined') {
        window.location.href = '/#/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// API fonksiyonları
const apiService = {
  // Authentication endpoints
  auth: {
    // Kullanıcı kaydı
    register: async (userData) => {
      const response = await api.post('/api/auth/register', userData);
      return response.data;
    },

    // Kullanıcı girişi
    login: async (credentials) => {
      const response = await api.post('/api/auth/login', credentials);
      return response.data;
    },

    // Kullanıcı çıkışı
    logout: async () => {
      const response = await api.post('/api/auth/logout');
      return response.data;
    },

    // Mevcut kullanıcı bilgilerini getir
    getMe: async () => {
      const response = await api.get('/api/auth/me');
      return response.data;
    },
  },

  // Product endpoints
  products: {
    // Tüm ürünleri listele
    getAll: async (params = {}) => {
      const response = await api.get('/api/products', { params });
      return response.data;
    },

    // Tek ürün getir
    getById: async (id) => {
      const response = await api.get(`/api/products/${id}`);
      return response.data;
    },

    // Yeni ürün oluştur
    create: async (productData) => {
      const response = await api.post('/api/products', productData);
      return response.data;
    },

    // Ürün güncelle
    update: async (id, productData) => {
      const response = await api.put(`/api/products/${id}`, productData);
      return response.data;
    },

    // Ürün sil
    delete: async (id) => {
      const response = await api.delete(`/api/products/${id}`);
      return response.data;
    },

    // Kategorileri listele
    getCategories: async () => {
      const response = await api.get('/api/products/categories');
      return response.data;
    },

    // İstatistikleri getir
    getStats: async () => {
      const response = await api.get('/api/products/stats');
      return response.data;
    },
  },

  // Stock Movement endpoints
  stockMovements: {
    // Stok hareketlerini listele
    getAll: async (params = {}) => {
      const response = await api.get('/api/stock-movements', { params });
      return response.data;
    },

    // Manuel stok hareketi oluştur
    createManual: async (movementData) => {
      const response = await api.post('/api/stock-movements/manual', movementData);
      return response.data;
    },

    // Toplu stok girişi
    uploadEntry: async (fileData) => {
      const response = await api.post('/api/stock-movements/upload-entry', fileData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
  },

  // Dashboard endpoints
  dashboard: {
    // Dashboard istatistiklerini getir
    getStats: async () => {
      const response = await api.get('/api/dashboard/stats');
      return response.data;
    },

    // Grafik verilerini getir
    getChartData: async (params = {}) => {
      const response = await api.get('/api/dashboard/chart-data', { params });
      return response.data;
    },
  },

  // Utility endpoints
  health: {
    // API sağlık kontrolü
    check: async () => {
      const response = await api.get('/api/health');
      return response.data;
    },

    // Veritabanı bağlantı testi
    dbTest: async () => {
      const response = await api.get('/api/db-test');
      return response.data;
    },
  },
};

// Token yönetimi fonksiyonları
export const tokenManager = {
  // Token'ı kaydet
  setToken: (token) => {
    storage.set('authToken', token);
  },

  // Token'ı al
  getToken: () => {
    return storage.get('authToken');
  },

  // Token'ı sil
  removeToken: () => {
    storage.remove('authToken');
  },

  // Token'ın varlığını kontrol et
  hasToken: () => {
    return !!storage.get('authToken');
  },
};

// Kullanıcı yönetimi fonksiyonları
export const userManager = {
  // Kullanıcı bilgilerini kaydet
  setUser: (user) => {
    storage.set('user', user);
  },

  // Kullanıcı bilgilerini al
  getUser: () => {
    return storage.get('user');
  },

  // Kullanıcı bilgilerini sil
  removeUser: () => {
    storage.remove('user');
  },

  // Kullanıcının giriş yapıp yapmadığını kontrol et
  isLoggedIn: () => {
    return !!storage.get('user') && !!storage.get('authToken');
  },
};

// Hata yönetimi
export const errorHandler = {
  // API hatalarını işle
  handleApiError: (error) => {
    if (error.response) {
      // Sunucu yanıt verdi ama hata kodu
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          return {
            type: 'validation',
            message: data.message || 'Geçersiz veri',
            errors: data.errors || []
          };
        case 401:
          return {
            type: 'auth',
            message: 'Yetkisiz erişim. Lütfen tekrar giriş yapın.',
            code: data.error
          };
        case 403:
          return {
            type: 'permission',
            message: 'Bu işlem için yetkiniz yok.',
            code: data.error
          };
        case 404:
          return {
            type: 'not_found',
            message: data.message || 'Kaynak bulunamadı.',
            code: data.error
          };
        case 409:
          return {
            type: 'conflict',
            message: data.message || 'Çakışma hatası.',
            code: data.error
          };
        case 422:
          return {
            type: 'validation',
            message: data.message || 'Doğrulama hatası.',
            errors: data.errors || []
          };
        case 500:
          return {
            type: 'server',
            message: 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.',
            code: data.error
          };
        default:
          return {
            type: 'unknown',
            message: data.message || 'Bilinmeyen hata oluştu.',
            code: data.error
          };
      }
    } else if (error.request) {
      // İstek gönderildi ama yanıt alınamadı
      return {
        type: 'network',
        message: 'Ağ hatası. İnternet bağlantınızı kontrol edin.',
        code: 'NETWORK_ERROR'
      };
    } else {
      // İstek hazırlanırken hata oluştu
      return {
        type: 'request',
        message: 'İstek hazırlanırken hata oluştu.',
        code: 'REQUEST_ERROR'
      };
    }
  },

  // Genel hata mesajı
  getErrorMessage: (error) => {
    const handledError = errorHandler.handleApiError(error);
    return handledError.message;
  }
};

// API durumu kontrolü
export const apiStatus = {
  // API'nin çalışıp çalışmadığını kontrol et
  check: async () => {
    try {
      const response = await api.get('/api/health');
      return response.data.status === 'healthy';
    } catch (error) {
      return false;
    }
  },

  // Veritabanı bağlantısını kontrol et
  checkDatabase: async () => {
    try {
      const response = await api.get('/api/db-test');
      return response.data.status === 'success';
    } catch (error) {
      return false;
    }
  }
};

// Eksik fonksiyonlar - Backward compatibility için
export const uploadStockFile = apiService.stockMovements.uploadEntry;
export const getDashboardStats = apiService.dashboard.getStats;
export const getChartData = apiService.dashboard.getChartData;
export const getMovements = apiService.stockMovements.getAll;
export const addMovement = apiService.stockMovements.createManual;
export const getProducts = apiService.products.getAll;

// apiService objesini de export et
export { apiService };

// Varsayılan export
export default api;
