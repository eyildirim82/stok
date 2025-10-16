// Uygulama sabitleri

/**
 * API Endpoint'leri
 */
export const API_ENDPOINTS = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout'
  },
  PRODUCTS: {
    LIST: '/api/products',
    CREATE: '/api/products',
    UPDATE: (id: number) => `/api/products/${id}`,
    DELETE: (id: number) => `/api/products/${id}`
  },
  STOCK_MOVEMENTS: {
    LIST: '/api/stock-movements',
    MANUAL: '/api/stock-movements/manual',
    UPLOAD: '/api/stock-movements/upload-entry'
  }
} as const;

/**
 * Stok hareket tipleri
 */
export const STOCK_MOVEMENT_TYPES = {
  GIRIS: 'GIRIS',
  CIKIS: 'CIKIS'
} as const;

/**
 * Ürün kategorileri
 */
export const PRODUCT_CATEGORIES = [
  'Elektronik',
  'Giyim',
  'Ev & Yaşam',
  'Spor & Outdoor',
  'Kitap & Medya',
  'Oyuncak & Hobi',
  'Sağlık & Güzellik',
  'Otomotiv',
  'Diğer'
] as const;

/**
 * Sayfa başlıkları
 */
export const PAGE_TITLES = {
  DASHBOARD: 'Dashboard',
  PRODUCTS: 'Ürün Yönetimi',
  STOCK_IN: 'Stok Girişi',
  STOCK_OUT: 'Stok Çıkışı',
  MOVEMENTS: 'Stok Hareketleri',
  BULK_UPLOAD: 'Toplu Yükleme',
  LOGIN: 'Giriş Yap'
} as const;

/**
 * Form validasyon mesajları
 */
export const VALIDATION_MESSAGES = {
  REQUIRED: 'Bu alan zorunludur',
  EMAIL_INVALID: 'Geçerli bir e-posta adresi giriniz',
  PASSWORD_MIN: 'Şifre en az 6 karakter olmalıdır',
  NUMBER_INVALID: 'Geçerli bir sayı giriniz',
  POSITIVE_NUMBER: 'Pozitif bir sayı giriniz'
} as const;

/**
 * Başarı/Hata mesajları
 */
export const MESSAGES = {
  SUCCESS: {
    LOGIN: 'Giriş başarılı',
    LOGOUT: 'Çıkış başarılı',
    PRODUCT_CREATED: 'Ürün başarıyla oluşturuldu',
    PRODUCT_UPDATED: 'Ürün başarıyla güncellendi',
    PRODUCT_DELETED: 'Ürün başarıyla silindi',
    STOCK_MOVEMENT_CREATED: 'Stok hareketi başarıyla oluşturuldu',
    BULK_UPLOAD_SUCCESS: 'Toplu yükleme başarılı'
  },
  ERROR: {
    LOGIN_FAILED: 'Giriş başarısız',
    NETWORK_ERROR: 'Ağ hatası oluştu',
    UNAUTHORIZED: 'Yetkisiz erişim',
    VALIDATION_ERROR: 'Form doğrulama hatası',
    SERVER_ERROR: 'Sunucu hatası oluştu'
  }
} as const;
