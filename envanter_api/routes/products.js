const express = require('express');
const { 
  getAllProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  getCategories,
  getProductStats
} = require('../controllers/productController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/products
 * @desc    Tüm ürünleri listele (sayfalama, arama, filtreleme ile)
 * @access  Private
 * @query   page, limit, search, category, sortBy, sortOrder
 */
router.get('/', authenticateToken, getAllProducts);

/**
 * @route   GET /api/products/categories
 * @desc    Ürün kategorilerini listele
 * @access  Private
 */
router.get('/categories', authenticateToken, getCategories);

/**
 * @route   GET /api/products/stats
 * @desc    Ürün istatistiklerini getir
 * @access  Private
 */
router.get('/stats', authenticateToken, getProductStats);

/**
 * @route   GET /api/products/:id
 * @desc    Tek ürün getir (stok hareketleri ile)
 * @access  Private
 */
router.get('/:id', authenticateToken, getProductById);

/**
 * @route   POST /api/products
 * @desc    Yeni ürün oluştur
 * @access  Private
 * @body    urunKodu, kategori, alisFiyati, listeFiyati
 */
router.post('/', authenticateToken, createProduct);

/**
 * @route   PUT /api/products/:id
 * @desc    Ürün güncelle
 * @access  Private
 * @body    urunKodu, kategori, alisFiyati, listeFiyati, mevcutMiktar
 */
router.put('/:id', authenticateToken, updateProduct);

/**
 * @route   DELETE /api/products/:id
 * @desc    Ürün sil (stok hareketleri yoksa)
 * @access  Private
 */
router.delete('/:id', authenticateToken, deleteProduct);

module.exports = router;
