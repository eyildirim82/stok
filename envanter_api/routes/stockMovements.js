const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { stockImportUpload } = require('../middleware/importUpload');
const {
  getStockMovements,
  createManualStockMovement,
} = require('../controllers/stockMovementController');
const { importStockMovements } = require('../controllers/bulkStockImportController');

// Listeleme (korumalı)
router.get('/', authenticateToken, getStockMovements);

// Manuel stok hareketi (korumalı)
router.post('/manual', authenticateToken, createManualStockMovement);

// CSV/XLSX toplu stok hareketi importu (korumalı, all-or-nothing)
router.post('/upload-entry', authenticateToken, stockImportUpload, importStockMovements);

module.exports = router;
