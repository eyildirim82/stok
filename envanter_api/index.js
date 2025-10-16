const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

// Prisma Client'ı başlat
const prisma = new PrismaClient();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const stockMovementRoutes = require('./routes/stockMovements');
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/stock-movements', stockMovementRoutes);

// Basit test endpoint'i
app.get('/', (req, res) => {
  res.json({ 
    message: 'Envanter API Sunucusu Çalışıyor!',
    status: 'success',
    timestamp: new Date().toISOString()
  });
});

// API sağlık kontrolü
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Veritabanı bağlantı testi
app.get('/api/db-test', async (req, res) => {
  try {
    await prisma.$connect();
    res.json({
      status: 'success',
      message: 'Veritabanı bağlantısı başarılı!',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Veritabanı bağlantı hatası',
      error: error.message
    });
  }
});

// Sunucuyu başlat
app.listen(PORT, () => {
  console.log(`🚀 Envanter API sunucusu ${PORT} portunda çalışıyor`);
  console.log(`📍 Test için: http://localhost:${PORT}`);
  console.log(`🔍 Sağlık kontrolü: http://localhost:${PORT}/api/health`);
});

module.exports = app;
