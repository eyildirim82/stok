import axios from 'axios';
import { storage } from '../utils';
import type {
  Product,
  ProductFormData,
  StockMovement,
  StockMovementFormData,
  User,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = storage.get<string>('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      storage.remove('authToken');
      storage.remove('user');
      if (typeof window !== 'undefined' && window.location.hash !== '#/login') {
        window.location.href = '/#/login';
      }
    }
    return Promise.reject(error);
  },
);

type ProductListResponse = {
  success: boolean;
  data: {
    products: Product[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
};

type MovementListResponse = {
  success: boolean;
  message?: string;
  data: {
    movements: StockMovement[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
};

type AuthResponse = {
  success: boolean;
  message?: string;
  data: {
    user: User;
    token: string;
  };
};

type CurrentUserResponse = {
  success: boolean;
  data: {
    user: User;
  };
};

export const apiService = {
  auth: {
    register: async (userData: { username: string; password: string }) => {
      const response = await api.post<AuthResponse>('/api/auth/register', userData);
      return response.data;
    },

    login: async (credentials: { username: string; password: string }) => {
      const response = await api.post<AuthResponse>('/api/auth/login', credentials);
      return response.data;
    },

    logout: async () => {
      const response = await api.post('/api/auth/logout');
      return response.data;
    },

    getMe: async () => {
      const response = await api.get<CurrentUserResponse>('/api/auth/me');
      return response.data;
    },
  },

  products: {
    getAll: async (params: Record<string, unknown> = {}) => {
      const response = await api.get<ProductListResponse>('/api/products', { params });
      return response.data;
    },

    getById: async (id: number) => {
      const response = await api.get(`/api/products/${id}`);
      return response.data;
    },

    create: async (productData: ProductFormData) => {
      const response = await api.post('/api/products', productData);
      return response.data;
    },

    update: async (
      id: number,
      productData: Partial<Omit<ProductFormData, 'mevcutMiktar'>>,
    ) => {
      const response = await api.put(`/api/products/${id}`, productData);
      return response.data;
    },

    delete: async (id: number) => {
      const response = await api.delete(`/api/products/${id}`);
      return response.data;
    },

    getCategories: async () => {
      const response = await api.get('/api/products/categories');
      return response.data;
    },

    getStats: async () => {
      const response = await api.get('/api/products/stats');
      return response.data;
    },
  },

  stockMovements: {
    getAll: async (params: Record<string, unknown> = {}) => {
      const response = await api.get<MovementListResponse>('/api/stock-movements', { params });
      return response.data;
    },

    createManual: async (movementData: StockMovementFormData) => {
      const response = await api.post('/api/stock-movements/manual', movementData);
      return response.data;
    },

    uploadEntry: async (_fileData: FormData) => {
      throw new Error('Toplu stok yükleme backend tarafından henüz desteklenmiyor.');
    },
  },

  health: {
    check: async () => {
      const response = await api.get('/api/health');
      return response.data;
    },

    dbTest: async () => {
      const response = await api.get('/api/db-test');
      return response.data;
    },
  },
};

const fetchAllProducts = async (): Promise<Product[]> => {
  const first = await apiService.products.getAll({ page: 1, limit: 100 });
  const products = [...first.data.products];

  for (let page = 2; page <= first.data.pagination.pages; page += 1) {
    const response = await apiService.products.getAll({ page, limit: 100 });
    products.push(...response.data.products);
  }

  return products;
};

const fetchAllMovements = async (params: Record<string, unknown> = {}): Promise<StockMovement[]> => {
  const first = await apiService.stockMovements.getAll({ ...params, page: 1, limit: 100 });
  const movements = [...first.data.movements];

  for (let page = 2; page <= first.data.pagination.pages; page += 1) {
    const response = await apiService.stockMovements.getAll({ ...params, page, limit: 100 });
    movements.push(...response.data.movements);
  }

  return movements;
};

export const getDashboardStats = async () => {
  const [products, movementPage] = await Promise.all([
    fetchAllProducts(),
    apiService.stockMovements.getAll({ page: 1, limit: 1 }),
  ]);

  const totalStockValue = products.reduce(
    (sum, product) => sum + product.alisFiyati * product.mevcutMiktar,
    0,
  );

  return {
    success: true,
    data: {
      totalProducts: products.length,
      totalStockValue,
      totalMovements: movementPage.data.pagination.total,
      lowStockProducts: products.filter(
        (product) => product.mevcutMiktar > 0 && product.mevcutMiktar <= 10,
      ).length,
    },
  };
};

export const getChartData = async () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - 6);

  const movements = await fetchAllMovements({ dateFrom: start.toISOString() });
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });

  const inbound: number[] = [];
  const outbound: number[] = [];

  for (const date of days) {
    const key = date.toDateString();
    const daily = movements.filter(
      (movement) => new Date(movement.movementDate).toDateString() === key,
    );

    inbound.push(
      daily
        .filter((movement) => movement.movementType === 'GIRIS')
        .reduce((sum, movement) => sum + movement.quantity, 0),
    );
    outbound.push(
      daily
        .filter((movement) => movement.movementType === 'CIKIS')
        .reduce((sum, movement) => sum + movement.quantity, 0),
    );
  }

  return {
    success: true,
    data: {
      labels: days.map((date) =>
        date.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' }),
      ),
      datasets: [
        { label: 'Giriş', data: inbound, backgroundColor: [] as string[] },
        { label: 'Çıkış', data: outbound, backgroundColor: [] as string[] },
      ],
    },
  };
};

export const tokenManager = {
  setToken: (token: string) => storage.set('authToken', token),
  getToken: () => storage.get<string>('authToken'),
  removeToken: () => storage.remove('authToken'),
  hasToken: () => Boolean(storage.get<string>('authToken')),
};

export const userManager = {
  setUser: (user: User) => storage.set('user', user),
  getUser: () => storage.get<User>('user'),
  removeUser: () => storage.remove('user'),
  isLoggedIn: () => Boolean(storage.get<User>('user') && storage.get<string>('authToken')),
};

export const errorHandler = {
  handleApiError: (error: any) => {
    if (error?.response) {
      const { status, data } = error.response;
      const message = data?.message || 'API isteği başarısız oldu.';

      switch (status) {
        case 400:
        case 422:
          return { type: 'validation', message, code: data?.error, errors: data?.errors || [] };
        case 401:
          return { type: 'auth', message, code: data?.error };
        case 403:
          return { type: 'permission', message, code: data?.error };
        case 404:
          return { type: 'not_found', message, code: data?.error };
        case 409:
          return { type: 'conflict', message, code: data?.error };
        case 500:
          return { type: 'server', message, code: data?.error };
        default:
          return { type: 'unknown', message, code: data?.error };
      }
    }

    if (error?.request) {
      return {
        type: 'network',
        message: 'Ağ hatası. API sunucusuna ulaşılamıyor.',
        code: 'NETWORK_ERROR',
      };
    }

    return {
      type: 'request',
      message: error?.message || 'İstek hazırlanırken hata oluştu.',
      code: 'REQUEST_ERROR',
    };
  },
};

export const apiStatus = {
  check: async () => {
    try {
      const response = await apiService.health.check();
      return response.status === 'healthy';
    } catch {
      return false;
    }
  },

  checkDatabase: async () => {
    try {
      const response = await apiService.health.dbTest();
      return response.status === 'success';
    } catch {
      return false;
    }
  },
};

export const getMovements = apiService.stockMovements.getAll;
export const addMovement = apiService.stockMovements.createManual;
export const getProducts = async () => apiService.products.getAll({ page: 1, limit: 100 });
export const uploadStockFile = apiService.stockMovements.uploadEntry;

export default api;
