const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getStockMovements } = require('../controllers/stockMovementController');

// Listeleme (korumalı)
router.get('/', authenticateToken, getStockMovements);

module.exports = router;


