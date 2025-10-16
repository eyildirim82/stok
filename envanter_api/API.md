# Envanter API Dokümantasyonu

## 🔐 Authentication Endpoints

### POST /api/auth/register
Yeni kullanıcı kaydı oluşturur.

**Request Body:**
```json
{
  "username": "string (min: 3 karakter)",
  "password": "string (min: 6 karakter)"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Kullanıcı başarıyla oluşturuldu",
  "data": {
    "user": {
      "id": 1,
      "username": "testuser",
      "createdAt": "2025-10-13T17:46:24.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
- `400` - Eksik alanlar
- `409` - Kullanıcı adı zaten mevcut
- `500` - Sunucu hatası

---

### POST /api/auth/login
Kullanıcı girişi yapar.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Giriş başarılı",
  "data": {
    "user": {
      "id": 1,
      "username": "testuser",
      "createdAt": "2025-10-13T17:46:24.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
- `400` - Eksik alanlar
- `401` - Geçersiz kimlik bilgileri
- `500` - Sunucu hatası

---

### POST /api/auth/logout
Kullanıcı çıkışı yapar.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Çıkış başarılı"
}
```

---

### GET /api/auth/me
Mevcut kullanıcı bilgilerini getirir.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "testuser",
      "createdAt": "2025-10-13T17:46:24.000Z"
    }
  }
}
```

**Error Responses:**
- `401` - Token gerekli veya geçersiz
- `500` - Sunucu hatası

---

## 🛠️ Test Komutları

### cURL ile Test

#### 1. Kullanıcı Kaydı
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass123"}'
```

#### 2. Kullanıcı Girişi
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass123"}'
```

#### 3. Me Endpoint (Token ile)
```bash
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### JavaScript ile Test
```javascript
// Kayıt
const registerResponse = await fetch('http://localhost:3001/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'testuser',
    password: 'testpass123'
  })
});

// Giriş
const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'testuser',
    password: 'testpass123'
  })
});

// Me endpoint
const meResponse = await fetch('http://localhost:3001/api/auth/me', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

## 🔧 Environment Variables

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/envanter_db?schema=public
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h
NODE_ENV=development
PORT=3001
```

---

## 🚀 Başlatma

```bash
# Bağımlılıkları yükle
npm install

# Veritabanı migration'ını çalıştır
npx prisma migrate dev

# Sunucuyu başlat
npm run dev
```

---

## 📊 Hata Kodları

| Kod | Açıklama |
|-----|----------|
| `MISSING_FIELDS` | Gerekli alanlar eksik |
| `INVALID_USERNAME` | Geçersiz kullanıcı adı |
| `INVALID_PASSWORD` | Geçersiz şifre |
| `USERNAME_EXISTS` | Kullanıcı adı zaten mevcut |
| `INVALID_CREDENTIALS` | Geçersiz kimlik bilgileri |
| `MISSING_TOKEN` | Token gerekli |
| `INVALID_TOKEN` | Geçersiz token |
| `TOKEN_EXPIRED` | Token süresi dolmuş |
| `INTERNAL_ERROR` | Sunucu hatası |

---

## 🔒 Güvenlik

- Şifreler bcryptjs ile hash'lenir (12 salt rounds)
- JWT token'lar stateless olarak çalışır
- Token süresi varsayılan 24 saat
- CORS etkin
- Input validation yapılır
- SQL injection koruması (Prisma ORM)
