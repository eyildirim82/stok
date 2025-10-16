# Envanter Yönetim Sistemi

Modern web tabanlı envanter yönetim sistemi. Node.js + React + PostgreSQL + Docker ile geliştirilmiştir.

## 🏗️ Proje Yapısı

```
├── envanter_api/          # Node.js Backend API
│   ├── prisma/           # Veritabanı şeması
│   ├── index.js          # Ana sunucu dosyası
│   └── Dockerfile        # API container yapılandırması
├── envanter_ui/          # React Frontend UI
│   ├── src/              # Kaynak kodlar
│   └── Dockerfile        # UI container yapılandırması
├── docker-compose.yml     # Docker Compose yapılandırması
├── nginx.conf            # Nginx reverse proxy
└── Makefile              # Kolay yönetim komutları
```

## 🚀 Hızlı Başlangıç

### Gereksinimler
- Docker & Docker Compose
- Make (opsiyonel)

### 1. Projeyi Klonlayın
```bash
git clone <repository-url>
cd envanter-yonetim-sistemi
```

### 2. Docker ile Başlatın
```bash
# Tüm servisleri başlat
make up

# Veya Docker Compose ile
docker-compose up -d
```

### 3. Veritabanı Migration'ını Çalıştırın
```bash
make migrate
```

### 4. Uygulamaya Erişin
- **Frontend UI**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Nginx Proxy**: http://localhost:80
- **PostgreSQL**: localhost:5432

## 🛠️ Geliştirme

### Sadece Veritabanını Başlat
```bash
make db-only
```

### API'yi Geliştirme Modunda Çalıştır
```bash
cd envanter_api
npm run dev
```

### UI'yi Geliştirme Modunda Çalıştır
```bash
cd envanter_ui
npm run dev
```

### Tüm Servisleri Geliştirme Modunda Başlat
```bash
make dev
```

## 📊 Servisler

### 🗄️ PostgreSQL (Port: 5432)
- **Database**: envanter_db
- **User**: postgres
- **Password**: password
- **Host**: localhost

### 🔧 Node.js API (Port: 3001)
- **Framework**: Express.js
- **ORM**: Prisma
- **Authentication**: JWT
- **CORS**: Enabled

### ⚛️ React UI (Port: 3000)
- **Framework**: React 19
- **Build Tool**: Vite
- **Language**: TypeScript
- **Router**: React Router

### 🌐 Nginx Proxy (Port: 80)
- **API Routes**: /api/*
- **UI Routes**: /*
- **CORS**: Configured

## 🗃️ Veritabanı

### Modeller
- **User**: Kullanıcı bilgileri
- **Product**: Ürün bilgileri
- **StockMovement**: Stok hareketleri

### Migration Komutları
```bash
# Yeni migration oluştur
make migrate

# Migration'ları sıfırla
make migrate-reset

# Production migration
make migrate-deploy
```

### Prisma Komutları
```bash
# Prisma Client generate et
make prisma-generate

# Prisma Studio aç
make prisma-studio

# Schema'yı veritabanına push et
make prisma-push
```

## 📝 Kullanışlı Komutlar

### Servis Yönetimi
```bash
make up          # Tüm servisleri başlat
make down        # Tüm servisleri durdur
make restart     # Tüm servisleri yeniden başlat
make status     # Servis durumlarını göster
```

### Log Görüntüleme
```bash
make logs        # Tüm loglar
make logs-api    # Sadece API logları
make logs-ui     # Sadece UI logları
make logs-db     # Sadece DB logları
```

### Temizlik
```bash
make clean       # Container'ları ve volume'ları temizle
make clean-all    # Tüm Docker verilerini temizle
```

### Shell Erişimi
```bash
make shell-api   # API container'ına bağlan
make shell-db     # PostgreSQL'e bağlan
```

### Backup
```bash
make backup-db   # Veritabanını yedekle
make restore-db FILE=backup.sql  # Yedekten geri yükle
```

## 🔧 Yapılandırma

### Environment Variables

#### API (.env)
```env
DATABASE_URL=postgresql://postgres:password@db:5432/envanter_db?schema=public
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=24h
NODE_ENV=development
PORT=3001
```

#### UI (.env)
```env
VITE_API_URL=http://localhost:3001
VITE_APP_NAME=Envanter Yönetim Sistemi
VITE_APP_VERSION=1.0.0
VITE_NODE_ENV=development
```

## 🐛 Sorun Giderme

### Docker Sorunları
```bash
# Docker servislerini yeniden başlat
docker-compose down
docker-compose up -d

# Logları kontrol et
docker-compose logs -f

# Container'ları temizle
make clean
```

### Veritabanı Sorunları
```bash
# Veritabanını sıfırla
make migrate-reset

# Prisma Client'ı yeniden generate et
make prisma-generate
```

### Port Çakışması
Eğer portlar kullanımda ise, `docker-compose.yml` dosyasındaki port numaralarını değiştirin.

## 📚 API Dokümantasyonu

### Authentication Endpoints
- `POST /api/auth/login` - Kullanıcı girişi
- `POST /api/auth/register` - Kullanıcı kaydı
- `POST /api/auth/logout` - Kullanıcı çıkışı

### Product Endpoints
- `GET /api/products` - Ürün listesi
- `POST /api/products` - Yeni ürün
- `GET /api/products/:id` - Ürün detayı
- `PUT /api/products/:id` - Ürün güncelleme
- `DELETE /api/products/:id` - Ürün silme

### Stock Movement Endpoints
- `GET /api/stock-movements` - Stok hareketleri
- `POST /api/stock-movements/manual` - Manuel stok hareketi
- `POST /api/stock-movements/upload-entry` - Toplu stok girişi

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.
