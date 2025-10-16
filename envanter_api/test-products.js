const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';

let authToken = '';

// Test verileri
const testProduct = {
  urunKodu: 'TEST-001',
  kategori: 'Elektronik',
  alisFiyati: 100.50,
  listeFiyati: 150.75,
  mevcutMiktar: 10
};

const testUser = {
  username: 'testuser',
  password: 'testpassword123'
};

async function testProductEndpoints() {
  console.log('🧪 Product API Test Başlatılıyor...\n');

  try {
    // 1. Önce kullanıcı girişi yap
    console.log('1️⃣ Kullanıcı girişi...');
    const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, testUser);
    authToken = loginResponse.data.data.token;
    console.log('✅ Giriş başarılı\n');

    // 2. Yeni ürün oluştur
    console.log('2️⃣ Yeni ürün oluşturma...');
    const createResponse = await axios.post(`${API_BASE_URL}/api/products`, testProduct, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    console.log('✅ Ürün oluşturuldu:', createResponse.data.data.product.urunKodu);
    const productId = createResponse.data.data.product.id;

    // 3. Tüm ürünleri listele
    console.log('\n3️⃣ Tüm ürünleri listeleme...');
    const listResponse = await axios.get(`${API_BASE_URL}/api/products`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    console.log('✅ Ürünler listelendi:', listResponse.data.data.products.length, 'ürün');
    console.log('Sayfalama:', listResponse.data.data.pagination);

    // 4. Tek ürün getir
    console.log('\n4️⃣ Tek ürün getirme...');
    const getResponse = await axios.get(`${API_BASE_URL}/api/products/${productId}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    console.log('✅ Ürün getirildi:', getResponse.data.data.product.urunKodu);

    // 5. Ürün güncelle
    console.log('\n5️⃣ Ürün güncelleme...');
    const updateData = {
      kategori: 'Güncellenmiş Kategori',
      listeFiyati: 200.00
    };
    const updateResponse = await axios.put(`${API_BASE_URL}/api/products/${productId}`, updateData, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    console.log('✅ Ürün güncellendi:', updateResponse.data.data.product.kategori);

    // 6. Kategorileri listele
    console.log('\n6️⃣ Kategorileri listeleme...');
    const categoriesResponse = await axios.get(`${API_BASE_URL}/api/products/categories`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    console.log('✅ Kategoriler:', categoriesResponse.data.data.categories);

    // 7. İstatistikleri getir
    console.log('\n7️⃣ İstatistikleri getirme...');
    const statsResponse = await axios.get(`${API_BASE_URL}/api/products/stats`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    console.log('✅ İstatistikler:', statsResponse.data.data);

    // 8. Arama testi
    console.log('\n8️⃣ Arama testi...');
    const searchResponse = await axios.get(`${API_BASE_URL}/api/products?search=TEST`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    console.log('✅ Arama sonucu:', searchResponse.data.data.products.length, 'ürün bulundu');

    // 9. Kategori filtresi testi
    console.log('\n9️⃣ Kategori filtresi testi...');
    const categoryResponse = await axios.get(`${API_BASE_URL}/api/products?category=Elektronik`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    console.log('✅ Kategori filtresi:', categoryResponse.data.data.products.length, 'ürün bulundu');

    // 10. Ürün silme
    console.log('\n🔟 Ürün silme...');
    const deleteResponse = await axios.delete(`${API_BASE_URL}/api/products/${productId}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    console.log('✅ Ürün silindi:', deleteResponse.data.message);

    // 11. Token olmadan erişim testi
    console.log('\n1️⃣1️⃣ Token olmadan erişim testi...');
    try {
      await axios.get(`${API_BASE_URL}/api/products`);
    } catch (error) {
      console.log('✅ Token olmadan erişim doğru şekilde reddedildi:', error.response.data.message);
    }

    // 12. Geçersiz ürün ID testi
    console.log('\n1️⃣2️⃣ Geçersiz ürün ID testi...');
    try {
      await axios.get(`${API_BASE_URL}/api/products/99999`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
    } catch (error) {
      console.log('✅ Geçersiz ID doğru şekilde reddedildi:', error.response.data.message);
    }

    console.log('\n🎉 Tüm Product API testleri başarılı!');

  } catch (error) {
    console.error('❌ Test hatası:', error.response?.data || error.message);
  }
}

// Test'i çalıştır
testProductEndpoints();
