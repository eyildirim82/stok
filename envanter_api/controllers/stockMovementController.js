const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const MOVEMENT_TYPES = new Set(['GIRIS', 'CIKIS']);

const requestError = (statusCode, errorCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.errorCode = errorCode;
  return error;
};

// GET /api/stock-movements
// Listeleme ve basit filtreler
exports.getStockMovements = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      productId,
      movementType,
      dateFrom,
      dateTo,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const pageNum = Number(page) || 1;
    const pageSize = Math.min(Number(limit) || 20, 100);

    const where = {};

    if (productId) {
      where.productId = Number(productId);
    }

    if (movementType) {
      where.movementType = movementType; // 'GIRIS' | 'CIKIS'
    }

    if (dateFrom || dateTo) {
      where.movementDate = {};
      if (dateFrom) where.movementDate.gte = new Date(dateFrom);
      if (dateTo) where.movementDate.lte = new Date(dateTo);
    }

    if (search) {
      // Ürün alanlarında arama
      where.OR = [
        { product: { urunKodu: { contains: String(search), mode: 'insensitive' } } },
        { product: { kategori: { contains: String(search), mode: 'insensitive' } } },
      ];
    }

    const [total, movements] = await Promise.all([
      prisma.stockMovement.count({ where }),
      prisma.stockMovement.findMany({
        where,
        include: {
          product: {
            select: {
              id: true,
              urunKodu: true,
              kategori: true,
              alisFiyati: true,
              listeFiyati: true,
              mevcutMiktar: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder === 'asc' ? 'asc' : 'desc' },
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    res.json({
      success: true,
      message: 'Stok hareketleri listelendi',
      data: {
        movements,
        pagination: {
          page: pageNum,
          limit: pageSize,
          total,
          pages: Math.ceil(total / pageSize),
        },
      },
    });
  } catch (error) {
    console.error('getStockMovements error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: 'INTERNAL_ERROR',
    });
  }
};

// POST /api/stock-movements/manual
// Hareket kaydı ile ürün stok miktarını tek transaction içinde günceller.
exports.createManualStockMovement = async (req, res) => {
  try {
    const {
      productId,
      movementType,
      quantity,
      faturaNo,
      movementDate,
    } = req.body;

    const parsedProductId = Number(productId);
    const parsedQuantity = Number(quantity);

    if (!Number.isInteger(parsedProductId) || parsedProductId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Geçerli bir ürün kimliği gerekli',
        error: 'INVALID_PRODUCT_ID',
      });
    }

    if (!MOVEMENT_TYPES.has(movementType)) {
      return res.status(400).json({
        success: false,
        message: 'Hareket tipi GIRIS veya CIKIS olmalıdır',
        error: 'INVALID_MOVEMENT_TYPE',
      });
    }

    if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Miktar pozitif bir tam sayı olmalıdır',
        error: 'INVALID_QUANTITY',
      });
    }

    const parsedMovementDate = movementDate ? new Date(movementDate) : new Date();
    if (Number.isNaN(parsedMovementDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz hareket tarihi',
        error: 'INVALID_MOVEMENT_DATE',
      });
    }

    const movement = await prisma.$transaction(async (tx) => {
      if (movementType === 'CIKIS') {
        // Koşullu UPDATE, eşzamanlı çıkışların aynı stoğu iki kez harcamasını önler.
        const updateResult = await tx.product.updateMany({
          where: {
            id: parsedProductId,
            mevcutMiktar: { gte: parsedQuantity },
          },
          data: {
            mevcutMiktar: { decrement: parsedQuantity },
          },
        });

        if (updateResult.count === 0) {
          const product = await tx.product.findUnique({
            where: { id: parsedProductId },
            select: { id: true, mevcutMiktar: true },
          });

          if (!product) {
            throw requestError(404, 'PRODUCT_NOT_FOUND', 'Ürün bulunamadı');
          }

          throw requestError(409, 'INSUFFICIENT_STOCK', 'Yetersiz stok');
        }
      } else {
        const updateResult = await tx.product.updateMany({
          where: { id: parsedProductId },
          data: {
            mevcutMiktar: { increment: parsedQuantity },
          },
        });

        if (updateResult.count === 0) {
          throw requestError(404, 'PRODUCT_NOT_FOUND', 'Ürün bulunamadı');
        }
      }

      return tx.stockMovement.create({
        data: {
          productId: parsedProductId,
          movementType,
          quantity: parsedQuantity,
          faturaNo: typeof faturaNo === 'string' && faturaNo.trim()
            ? faturaNo.trim()
            : null,
          movementDate: parsedMovementDate,
        },
        include: {
          product: {
            select: {
              id: true,
              urunKodu: true,
              kategori: true,
              alisFiyati: true,
              listeFiyati: true,
              mevcutMiktar: true,
            },
          },
        },
      });
    });

    res.status(201).json({
      success: true,
      message: 'Stok hareketi başarıyla oluşturuldu',
      data: { movement },
    });
  } catch (error) {
    if (error.statusCode && error.errorCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
        error: error.errorCode,
      });
    }

    console.error('createManualStockMovement error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: 'INTERNAL_ERROR',
    });
  }
};
