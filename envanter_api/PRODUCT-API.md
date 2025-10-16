# Product API Dokümantasyonu

## 📦 Product Endpoints

### GET /api/products
Tüm ürünleri listeler (sayfalama, arama, filtreleme ile).

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (number, default: 1) - Sayfa numarası
- `limit` (number, default: 10) - Sayfa başına kayıt sayısı
- `search` (string) - Ürün kodu veya kategori araması
- `category` (string) - Kategori filtresi
- `sortBy` (string, default: 'createdAt') - Sıralama alanı
- `sortOrder` (string, default: 'desc') - Sıralama yönü (asc/desc)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": 1,
        "urunKodu": "TEST-001",
        "kategori": "Elektronik",
        "alisFiyati": 100.50,
        "listeFiyati": 150.75,
        "mevcutMiktar": 10,
        "createdAt": "2025-10-13T17:46:24.000Z",
        "updatedAt": "2025-10-13T17:46:24.000Z",
        "stockMovements": []
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "pages": 1
    }
  }
}
```

---

### GET /api/products/:id
Tek ürün getirir (stok hareketleri ile).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "product": {
      "id": 1,
      "urunKodu": "TEST-001",
      "kategori": "Elektronik",
      "alisFiyati": 100.50,
      "listeFiyati": 150.75,
      "mevcutMiktar": 10,
      "createdAt": "2025-10-13T17:46:24.000Z",
      "updatedAt": "2025-10-13T17:46:24.000Z",
      "stockMovements": []
    }
  }
}
```

**Error Responses:**
- `404` - Ürün bulunamadı

---

### POST /api/products
Yeni ürün oluşturur.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "urunKodu": "string (unique, required)",
  "kategori": "string (required)",
  "alisFiyati": "number (required, >= 0)",
  "listeFiyati": "number (required, >= 0)",
  "mevcutMiktar": "number (optional, default: 0)"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Ürün başarıyla oluşturuldu",
  "data": {
    "product": {
      "id": 1,
      "urunKodu": "TEST-001",
      "kategori": "Elektronik",
      "alisFiyati": 100.50,
      "listeFiyati": 150.75,
      "mevcutMiktar": 10,
      "createdAt": "2025-10-13T17:46:24.000Z",
      "updatedAt": "2025-10-13T17:46:24.000Z"
    }
  }
}
```

**Error Responses:**
- `400` - Eksik alanlar veya geçersiz fiyat
- `409` - Ürün kodu zaten mevcut

---

### PUT /api/products/:id
Ürün günceller.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "urunKodu": "string (optional)",
  "kategori": "string (optional)",
  "alisFiyati": "number (optional, >= 0)",
  "listeFiyati": "number (optional, >= 0)",
  "mevcutMiktar": "number (optional)"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Ürün başarıyla güncellendi",
  "data": {
    "product": {
      "id": 1,
      "urunKodu": "TEST-001",
      "kategori": "Güncellenmiş Kategori",
      "alisFiyati": 100.50,
      "listeFiyati": 200.00,
      "mevcutMiktar": 10,
      "createdAt": "2025-10-13T17:46:24.000Z",
      "updatedAt": "2025-10-13T17:46:24.000Z"
    }
  }
}
```

**Error Responses:**
- `400` - Geçersiz fiyat
- `404` - Ürün bulunamadı
- `409` - Ürün kodu zaten mevcut

---

### DELETE /api/products/:id
Ürün siler (stok hareketleri yoksa).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Ürün başarıyla silindi"
}
```

**Error Responses:**
- `400` - Ürünün stok hareketleri var
- `404` - Ürün bulunamadı

---

### GET /api/products/categories
Ürün kategorilerini listeler.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "categories": [
      "Elektronik",
      "Giyim",
      "Ev & Yaşam"
    ]
  }
}
```

---

### GET /api/products/stats
Ürün istatistiklerini getirir.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalProducts": 10,
    "totalStockQuantity": 150,
    "totalStockValue": 15000.50,
    "categoryStats": [
      {
        "kategori": "Elektronik",
        "_count": { "id": 5 },
        "_sum": { "mevcutMiktar": 75 }
      }
    ]
  }
}
```

---

## 🧪 Test Komutları

### cURL ile Test

#### 1. Tüm Ürünleri Listele
```bash
curl -X GET "http://localhost:3001/api/products?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### 2. Yeni Ürün Oluştur
```bash
curl -X POST http://localhost:3001/api/products \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "urunKodu": "TEST-001",
    "kategori": "Elektronik",
    "alisFiyati": 100.50,
    "listeFiyati": 150.75,
    "mevcutMiktar": 10
  }'
```

#### 3. Ürün Güncelle
```bash
curl -X PUT http://localhost:3001/api/products/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "kategori": "Güncellenmiş Kategori",
    "listeFiyati": 200.00
  }'
```

#### 4. Ürün Sil
```bash
curl -X DELETE http://localhost:3001/api/products/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### JavaScript ile Test
```javascript
const token = 'YOUR_TOKEN_HERE';

// Tüm ürünleri listele
const products = await fetch('http://localhost:3001/api/products', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// Yeni ürün oluştur
const newProduct = await fetch('http://localhost:3001/api/products', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    urunKodu: 'TEST-001',
    kategori: 'Elektronik',
    alisFiyati: 100.50,
    listeFiyati: 150.75,
    mevcutMiktar: 10
  })
});

// Ürün güncelle
const updatedProduct = await fetch('http://localhost:3001/api/products/1', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    kategori: 'Güncellenmiş Kategori',
    listeFiyati: 200.00
  })
});
```

---

## 📊 Hata Kodları

| Kod | Açıklama |
|-----|----------|
| `MISSING_FIELDS` | Gerekli alanlar eksik |
| `PRODUCT_NOT_FOUND` | Ürün bulunamadı |
| `PRODUCT_CODE_EXISTS` | Ürün kodu zaten mevcut |
| `INVALID_PRICE` | Geçersiz fiyat |
| `PRODUCT_HAS_MOVEMENTS` | Ürünün stok hareketleri var |
| `MISSING_TOKEN` | Token gerekli |
| `INVALID_TOKEN` | Geçersiz token |
| `INTERNAL_ERROR` | Sunucu hatası |

---

## 🔍 Özellikler

### 📄 Sayfalama
- `page`: Sayfa numarası (1'den başlar)
- `limit`: Sayfa başına kayıt sayısı
- `total`: Toplam kayıt sayısı
- `pages`: Toplam sayfa sayısı

### 🔍 Arama ve Filtreleme
- `search`: Ürün kodu veya kategori araması
- `category`: Kategori filtresi
- `sortBy`: Sıralama alanı (createdAt, urunKodu, kategori, alisFiyati, listeFiyati, mevcutMiktar)
- `sortOrder`: Sıralama yönü (asc, desc)

### 📊 İstatistikler
- Toplam ürün sayısı
- Toplam stok miktarı
- Toplam stok değeri
- Kategori bazında istatistikler

### 🔒 Güvenlik
- Tüm endpoint'ler JWT token ile korunur
- Input validation yapılır
- SQL injection koruması (Prisma ORM)
- Unique constraint kontrolü
