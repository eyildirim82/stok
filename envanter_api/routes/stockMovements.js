const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  getStockMovements,
  createManualStockMovement,
} = require('../controllers/stockMovementController');

// Listeleme (korumalı)
router.get('/', authenticateToken, getStockMovements);

// Manuel stok hareketi (korumalı)
router.post('/manual', authenticateToken, createManualStockMovement);

module.exports = router;
