const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';

// Test verileri
const testUser = {
  username: 'testuser',
  password: 'testpassword123'
};

async function testAuthEndpoints() {
  console.log('🧪 Authentication API Test Başlatılıyor...\n');

  try {
    // 1. Kullanıcı kaydı testi
    console.log('1️⃣ Kullanıcı kaydı testi...');
    const registerResponse = await axios.post(`${API_BASE_URL}/api/auth/register`, testUser);
    console.log('✅ Kayıt başarılı:', registerResponse.data);
    console.log('Token:', registerResponse.data.data.token.substring(0, 50) + '...\n');

    // 2. Giriş testi
    console.log('2️⃣ Kullanıcı girişi testi...');
    const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, testUser);
    console.log('✅ Giriş başarılı:', loginResponse.data);
    console.log('Token:', loginResponse.data.data.token.substring(0, 50) + '...\n');

    // 3. Me endpoint testi (token ile)
    console.log('3️⃣ Me endpoint testi...');
    const token = loginResponse.data.data.token;
    const meResponse = await axios.get(`${API_BASE_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Me endpoint başarılı:', meResponse.data);
    console.log('Kullanıcı:', meResponse.data.data.user.username, '\n');

    // 4. Geçersiz token testi
    console.log('4️⃣ Geçersiz token testi...');
    try {
      await axios.get(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          'Authorization': 'Bearer invalid-token'
        }
      });
    } catch (error) {
      console.log('✅ Geçersiz token doğru şekilde reddedildi:', error.response.data.message);
    }

    // 5. Token olmadan erişim testi
    console.log('\n5️⃣ Token olmadan erişim testi...');
    try {
      await axios.get(`${API_BASE_URL}/api/auth/me`);
    } catch (error) {
      console.log('✅ Token olmadan erişim doğru şekilde reddedildi:', error.response.data.message);
    }

    // 6. Çıkış testi
    console.log('\n6️⃣ Çıkış testi...');
    const logoutResponse = await axios.post(`${API_BASE_URL}/api/auth/logout`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Çıkış başarılı:', logoutResponse.data.message);

    console.log('\n🎉 Tüm testler başarılı!');

  } catch (error) {
    console.error('❌ Test hatası:', error.response?.data || error.message);
  }
}

// Test'i çalıştır
testAuthEndpoints();
