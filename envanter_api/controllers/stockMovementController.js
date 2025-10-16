const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

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


