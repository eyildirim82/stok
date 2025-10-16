# Envanter Yönetim Sistemi Kurulum Rehberi

## 🚀 Hızlı Başlangıç

### 1. Backend Kurulumu (envanter_api)

#### Gerekli Adımlar:
1. **`.env` dosyası oluşturun:**
   ```bash
   cd envanter_api
   # .env dosyasını oluşturun ve aşağıdaki içeriği ekleyin:
   ```

   **envanter_api/.env** dosyası içeriği:
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/envanter_db?schema=public"
   JWT_SECRET=your-super-secret-jwt-key-here-change-in-production
   JWT_EXPIRES_IN=24h
   PORT=3001
   ```

2. **PostgreSQL Kurulumu:**
   - PostgreSQL 15+ kurulumu yapın
   - `envanter_db` veritabanını oluşturun:
     ```sql
     CREATE DATABASE envanter_db;
     ```

3. **Prisma Migration:**
   ```bash
   cd envanter_api
   npx prisma migrate dev
   ```

4. **Backend'i başlatın:**
   ```bash
   npm run dev
   ```

### 2. Frontend Kurulumu (envanter_ui)

#### Gerekli Adımlar:
1. **Frontend'i başlatın:**
   ```bash
   cd envanter_ui
   npm run dev
   ```

### 3. Erişim Adresleri

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **API Health:** http://localhost:3001/api/health

## 🔧 Sorun Giderme

### Database Bağlantı Hatası
- `.env` dosyasının doğru konumda olduğundan emin olun
- PostgreSQL servisinin çalıştığından emin olun
- Veritabanı adının doğru olduğundan emin olun

### Port Çakışması
- 3000 ve 3001 portlarının boş olduğundan emin olun
- Başka servisler bu portları kullanıyorsa durdurun

### API Bağlantı Hatası
- Backend servisinin çalıştığından emin olun
- CORS ayarlarının doğru olduğundan emin olun

## 📋 Sistem Gereksinimleri

- Node.js 18+
- PostgreSQL 15+
- npm veya yarn

## 🎯 Özellikler

- ✅ Kullanıcı Yönetimi (Kayıt/Giriş)
- ✅ Ürün CRUD İşlemleri
- ✅ Stok Hareket Yönetimi
- ✅ Dashboard ve İstatistikler
- ✅ Toplu Veri Yükleme
- ✅ Hareket Geçmişi
- ✅ Responsive Tasarım

## 🚀 Production Deployment

### Docker ile Çalıştırma:
```bash
docker compose up -d
```

### Manuel Kurulum:
1. Backend ve Frontend'i ayrı ayrı build edin
2. Production veritabanı ayarlarını yapın
3. Environment variables'ları production değerleriyle güncelleyin
