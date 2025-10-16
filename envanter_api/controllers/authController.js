const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Kullanıcı kayıt endpoint'i
 * POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Giriş verilerini doğrula
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Kullanıcı adı ve şifre gerekli',
        error: 'MISSING_FIELDS'
      });
    }

    // Kullanıcı adı uzunluk kontrolü
    if (username.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Kullanıcı adı en az 3 karakter olmalıdır',
        error: 'INVALID_USERNAME'
      });
    }

    // Şifre uzunluk kontrolü
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Şifre en az 6 karakter olmalıdır',
        error: 'INVALID_PASSWORD'
      });
    }

    // Kullanıcı adının benzersizliğini kontrol et
    const existingUser = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Bu kullanıcı adı zaten kullanılıyor',
        error: 'USERNAME_EXISTS'
      });
    }

    // Şifreyi hash'le
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Yeni kullanıcı oluştur
    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword
      },
      select: {
        id: true,
        username: true,
        createdAt: true
      }
    });

    // JWT token oluştur
    const token = jwt.sign(
      { 
        userId: newUser.id,
        username: newUser.username 
      },
      process.env.JWT_SECRET,
      { 
        expiresIn: process.env.JWT_EXPIRES_IN || '24h' 
      }
    );

    res.status(201).json({
      success: true,
      message: 'Kullanıcı başarıyla oluşturuldu',
      data: {
        user: newUser,
        token
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: 'INTERNAL_ERROR'
    });
  }
};

/**
 * Kullanıcı giriş endpoint'i
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Giriş verilerini doğrula
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Kullanıcı adı ve şifre gerekli',
        error: 'MISSING_FIELDS'
      });
    }

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz kullanıcı adı veya şifre',
        error: 'INVALID_CREDENTIALS'
      });
    }

    // Şifreyi doğrula
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz kullanıcı adı veya şifre',
        error: 'INVALID_CREDENTIALS'
      });
    }

    // JWT token oluştur
    const token = jwt.sign(
      { 
        userId: user.id,
        username: user.username 
      },
      process.env.JWT_SECRET,
      { 
        expiresIn: process.env.JWT_EXPIRES_IN || '24h' 
      }
    );

    // Kullanıcı bilgilerini döndür (şifre hariç)
    const userData = {
      id: user.id,
      username: user.username,
      createdAt: user.createdAt
    };

    res.json({
      success: true,
      message: 'Giriş başarılı',
      data: {
        user: userData,
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: 'INTERNAL_ERROR'
    });
  }
};

/**
 * Kullanıcı çıkış endpoint'i
 * POST /api/auth/logout
 */
const logout = async (req, res) => {
  try {
    // JWT token'lar stateless olduğu için sunucu tarafında bir işlem yapmaya gerek yok
    // Frontend'de token'ı silmek yeterli
    res.json({
      success: true,
      message: 'Çıkış başarılı'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: 'INTERNAL_ERROR'
    });
  }
};

/**
 * Mevcut kullanıcı bilgilerini getir
 * GET /api/auth/me
 */
const getMe = async (req, res) => {
  try {
    // Middleware'den gelen kullanıcı bilgilerini döndür
    res.json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: 'INTERNAL_ERROR'
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe
};
