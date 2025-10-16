# API Servisi Dokümantasyonu

## 📡 API Servisi (services/api.js)

Merkezi API yönetimi için axios tabanlı servis modülü.

### 🔧 Özellikler

- **JWT Token Otomatik Ekleme** - Her istekte Authorization header'ına token eklenir
- **Request/Response Interceptors** - Otomatik hata yönetimi
- **Token Yönetimi** - Local storage ile token saklama
- **Error Handling** - Merkezi hata yönetimi
- **TypeScript Desteği** - Tip güvenliği

### 🚀 Kullanım

```javascript
import { apiService, tokenManager, userManager } from '../services/api';

// Authentication
const loginResponse = await apiService.auth.login(credentials);
const registerResponse = await apiService.auth.register(userData);

// Products
const products = await apiService.products.getAll({ page: 1, limit: 10 });
const product = await apiService.products.getById(1);
const newProduct = await apiService.products.create(productData);

// Token yönetimi
tokenManager.setToken(token);
const token = tokenManager.getToken();
tokenManager.removeToken();

// Kullanıcı yönetimi
userManager.setUser(user);
const user = userManager.getUser();
userManager.removeUser();
```

## 🎣 Custom Hooks (hooks/useApi.js)

React hook'ları ile API kullanımı.

### useAuth Hook

```javascript
import { useAuth } from '../hooks/useApi';

const LoginComponent = () => {
  const { login, register, logout, loading, error } = useAuth();

  const handleLogin = async (credentials) => {
    try {
      const result = await login(credentials);
      console.log('Giriş başarılı:', result);
    } catch (error) {
      console.error('Giriş hatası:', error);
    }
  };

  return (
    <div>
      {loading && <p>Yükleniyor...</p>}
      {error && <p>Hata: {error.message}</p>}
      <button onClick={() => handleLogin(credentials)}>
        Giriş Yap
      </button>
    </div>
  );
};
```

### useProducts Hook

```javascript
import { useProducts } from '../hooks/useApi';

const ProductsComponent = () => {
  const { 
    getAllProducts, 
    createProduct, 
    updateProduct, 
    deleteProduct,
    loading, 
    error 
  } = useProducts();

  const handleGetProducts = async () => {
    try {
      const result = await getAllProducts({ page: 1, limit: 10 });
      console.log('Ürünler:', result.data.products);
    } catch (error) {
      console.error('Hata:', error);
    }
  };

  return (
    <div>
      {loading && <p>Yükleniyor...</p>}
      {error && <p>Hata: {error.message}</p>}
      <button onClick={handleGetProducts}>
        Ürünleri Getir
      </button>
    </div>
  );
};
```

## 🏗️ Context API (contexts/ApiContext.tsx)

Global API durumu yönetimi.

### ApiProvider Kullanımı

```javascript
import { ApiProvider, useApiContext } from '../contexts/ApiContext';

const App = () => {
  return (
    <ApiProvider>
      <YourApp />
    </ApiProvider>
  );
};

const YourComponent = () => {
  const { 
    isApiHealthy, 
    isDatabaseConnected, 
    isLoggedIn, 
    user,
    login,
    logout 
  } = useApiContext();

  return (
    <div>
      <p>API Durumu: {isApiHealthy ? 'Çalışıyor' : 'Çalışmıyor'}</p>
      <p>Veritabanı: {isDatabaseConnected ? 'Bağlı' : 'Bağlı Değil'}</p>
      <p>Kullanıcı: {isLoggedIn ? user.username : 'Giriş yapılmamış'}</p>
    </div>
  );
};
```

## 🔧 Yapılandırma

### Environment Variables

```env
VITE_API_URL=http://localhost:3001
VITE_APP_NAME=Envanter Yönetim Sistemi
VITE_APP_VERSION=1.0.0
```

### Axios Yapılandırması

```javascript
const api = axios.create({
  baseURL: 'http://localhost:3001',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

## 🔒 Güvenlik

### JWT Token Yönetimi

- **Otomatik Ekleme**: Her istekte Authorization header'ına token eklenir
- **Token Saklama**: Local storage'da güvenli saklama
- **Otomatik Temizleme**: 401 hatası durumunda token otomatik temizlenir
- **Yönlendirme**: Token geçersizse login sayfasına yönlendirme

### Hata Yönetimi

```javascript
// Hata türleri
const errorTypes = {
  validation: 'Doğrulama hatası',
  auth: 'Yetki hatası',
  permission: 'İzin hatası',
  not_found: 'Kaynak bulunamadı',
  conflict: 'Çakışma hatası',
  server: 'Sunucu hatası',
  network: 'Ağ hatası',
  request: 'İstek hatası'
};
```

## 📊 API Endpoint'leri

### Authentication
- `POST /api/auth/register` - Kullanıcı kaydı
- `POST /api/auth/login` - Kullanıcı girişi
- `POST /api/auth/logout` - Kullanıcı çıkışı
- `GET /api/auth/me` - Kullanıcı bilgileri

### Products
- `GET /api/products` - Ürünleri listele
- `GET /api/products/:id` - Tek ürün getir
- `POST /api/products` - Yeni ürün oluştur
- `PUT /api/products/:id` - Ürün güncelle
- `DELETE /api/products/:id` - Ürün sil
- `GET /api/products/categories` - Kategorileri listele
- `GET /api/products/stats` - İstatistikleri getir

### Health Check
- `GET /api/health` - API sağlık kontrolü
- `GET /api/db-test` - Veritabanı bağlantı testi

## 🧪 Test

### API Test Component

```javascript
import ApiTest from '../components/ApiTest';

// Test sayfasında kullanım
<ApiTest />
```

### Manuel Test

```javascript
// API durumunu kontrol et
const isHealthy = await apiStatus.check();
const isDbConnected = await apiStatus.checkDatabase();

// Hata yönetimi
try {
  const result = await apiService.products.getAll();
} catch (error) {
  const handledError = errorHandler.handleApiError(error);
  console.error('Hata:', handledError.message);
}
```

## 📝 Örnek Kullanım

### Tam Örnek Component

```javascript
import React, { useState, useEffect } from 'react';
import { useApiContext } from '../contexts/ApiContext';
import { useProducts } from '../hooks/useApi';

const ProductsPage = () => {
  const { isLoggedIn } = useApiContext();
  const { getAllProducts, createProduct, loading, error } = useProducts();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (isLoggedIn) {
      loadProducts();
    }
  }, [isLoggedIn]);

  const loadProducts = async () => {
    try {
      const result = await getAllProducts({ page: 1, limit: 10 });
      setProducts(result.data.products);
    } catch (error) {
      console.error('Ürünler yüklenemedi:', error);
    }
  };

  const handleCreateProduct = async (productData) => {
    try {
      await createProduct(productData);
      loadProducts(); // Listeyi yenile
    } catch (error) {
      console.error('Ürün oluşturulamadı:', error);
    }
  };

  if (!isLoggedIn) {
    return <div>Lütfen giriş yapın</div>;
  }

  return (
    <div>
      <h1>Ürünler</h1>
      {loading && <p>Yükleniyor...</p>}
      {error && <p>Hata: {error.message}</p>}
      <ul>
        {products.map(product => (
          <li key={product.id}>{product.urunKodu}</li>
        ))}
      </ul>
    </div>
  );
};

export default ProductsPage;
```
