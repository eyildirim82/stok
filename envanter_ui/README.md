# Envanter Yönetim Sistemi - Frontend

Modern React + TypeScript + Vite tabanlı envanter yönetim sistemi frontend uygulaması.

## 🚀 Teknolojiler

- **React 19** - UI kütüphanesi
- **TypeScript** - Tip güvenliği
- **Vite** - Hızlı build tool
- **React Router** - Sayfa yönlendirme
- **Recharts** - Grafik ve istatistikler
- **React Dropzone** - Dosya yükleme

## 📁 Proje Yapısı

```
src/
├── components/          # Yeniden kullanılabilir bileşenler
│   ├── Card.tsx
│   ├── DataTable.tsx
│   ├── Header.tsx
│   ├── Modal.tsx
│   ├── ProductForm.tsx
│   ├── ProtectedRoute.tsx
│   ├── Sidebar.tsx
│   ├── StockMovementForm.tsx
│   └── icons/
│       └── Icons.tsx
├── pages/              # Sayfa bileşenleri
│   ├── Dashboard.tsx
│   ├── Login.tsx
│   ├── Products.tsx
│   ├── StockInPage.tsx
│   ├── StockOutPage.tsx
│   ├── BulkUploadPage.tsx
│   └── Movements.tsx
├── services/           # API servisleri
│   └── api.ts
├── contexts/           # React Context'ler
│   └── AuthContext.tsx
├── hooks/              # Custom hook'lar
│   └── useAuth.ts
├── utils/              # Yardımcı fonksiyonlar
│   └── index.ts
├── constants/          # Sabitler
│   └── index.ts
├── styles/             # CSS stilleri
│   ├── globals.css
│   └── variables.css
└── assets/             # Statik dosyalar
```

## 🛠️ Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev

# Production build
npm run build

# Build önizleme
npm run preview
```

## 🔧 Yapılandırma

### Environment Variables

`.env` dosyası oluşturun:

```env
VITE_API_URL=http://localhost:3001
VITE_APP_NAME=Envanter Yönetim Sistemi
VITE_APP_VERSION=1.0.0
```

### TypeScript Path Mapping

`@/` alias'ı `src/` klasörünü işaret eder:

```typescript
import { formatDate } from '@/utils';
import { API_ENDPOINTS } from '@/constants';
import { AuthProvider } from '@/contexts/AuthContext';
```

## 📱 Özellikler

### 🔐 Kimlik Doğrulama
- Kullanıcı girişi/çıkışı
- JWT token yönetimi
- Korumalı rotalar

### 📦 Ürün Yönetimi
- Ürün listeleme
- Ürün ekleme/düzenleme/silme
- Kategori yönetimi
- Fiyat takibi

### 📊 Stok Yönetimi
- Stok girişi/çıkışı
- Stok hareketleri
- Toplu yükleme (Excel)
- Stok raporları

### 📈 Dashboard
- Genel istatistikler
- Grafik ve çizelgeler
- Son hareketler
- Hızlı erişim

## 🎨 Stil Sistemi

### CSS Variables
Modern CSS değişkenleri kullanılarak tutarlı tasarım:

```css
:root {
  --color-primary: #3b82f6;
  --color-success: #10b981;
  --color-error: #ef4444;
  --bg-primary: #ffffff;
  --text-primary: #111827;
}
```

### Utility Classes
Hızlı stil uygulama için utility sınıfları:

```html
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
  <h2 className="text-xl font-semibold text-gray-900">Başlık</h2>
</div>
```

## 🔌 API Entegrasyonu

### Servis Katmanı
Merkezi API yönetimi:

```typescript
// services/api.ts
export const api = {
  auth: {
    login: (credentials) => post('/api/auth/login', credentials),
    logout: () => post('/api/auth/logout')
  },
  products: {
    list: () => get('/api/products'),
    create: (data) => post('/api/products', data)
  }
};
```

### Error Handling
Merkezi hata yönetimi:

```typescript
try {
  const products = await api.products.list();
} catch (error) {
  console.error('API Error:', error);
  // Hata mesajı göster
}
```

## 🚀 Deployment

### Build
```bash
npm run build
```

### Preview
```bash
npm run preview
```

### Production
Build edilen dosyalar `dist/` klasöründe oluşturulur.

## 📝 Geliştirme Notları

- **TypeScript**: Tüm dosyalar tip güvenliği ile yazılmıştır
- **Responsive**: Mobil uyumlu tasarım
- **Accessibility**: Erişilebilirlik standartları
- **Performance**: Lazy loading ve code splitting
- **SEO**: Meta tag'ler ve semantic HTML

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.