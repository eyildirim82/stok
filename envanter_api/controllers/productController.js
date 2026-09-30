const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Tüm ürünleri listele
 * GET /api/products
 */
const getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    // Sayfalama parametreleri
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Filtreleme koşulları
    const where = {};
    
    if (search) {
      where.OR = [
        { urunKodu: { contains: search, mode: 'insensitive' } },
        { kategori: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (category) {
      where.kategori = category;
    }

    // Sıralama
    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    // Toplam kayıt sayısı
    const total = await prisma.product.count({ where });

    // Ürünleri getir
    const products = await prisma.product.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        stockMovements: {
          orderBy: { createdAt: 'desc' },
          take: 5 // Son 5 hareket
        }
      }
    });

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get all products error:', error);
    res.status(500).json({
      success: false,
      message: 'Ürünler getirilirken hata oluştu',
      error: 'INTERNAL_ERROR'
    });
  }
};

/**
 * Tek ürün getir
 * GET /api/products/:id
 */
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        stockMovements: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Ürün bulunamadı',
        error: 'PRODUCT_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: { product }
    });

  } catch (error) {
    console.error('Get product by id error:', error);
    res.status(500).json({
      success: false,
      message: 'Ürün getirilirken hata oluştu',
      error: 'INTERNAL_ERROR'
    });
  }
};

/**
 * Yeni ürün oluştur
 * POST /api/products
 */
const createProduct = async (req, res) => {
  try {
    const { urunKodu, kategori, alisFiyati, listeFiyati, mevcutMiktar } = req.body;

    // Gerekli alanları kontrol et
    if (!urunKodu || !kategori || alisFiyati === undefined || listeFiyati === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Ürün kodu, kategori, alış fiyatı ve liste fiyatı gerekli',
        error: 'MISSING_FIELDS'
      });
    }

    // İlk stok miktarı hareket kaydı olmadan yazılamaz.
    if (mevcutMiktar !== undefined && Number(mevcutMiktar) !== 0) {
      return res.status(400).json({
        success: false,
        message: 'İlk stok miktarını ürün oluşturduktan sonra stok girişi hareketi ile ekleyin',
        error: 'STOCK_UPDATE_REQUIRES_MOVEMENT'
      });
    }

    // Ürün kodu benzersizliğini kontrol et
    const existingProduct = await prisma.product.findUnique({
      where: { urunKodu }
    });

    if (existingProduct) {
      return res.status(409).json({
        success: false,
        message: 'Bu ürün kodu zaten kullanılıyor',
        error: 'PRODUCT_CODE_EXISTS'
      });
    }

    // Fiyat validasyonu
    if (alisFiyati < 0 || listeFiyati < 0) {
      return res.status(400).json({
        success: false,
        message: 'Fiyatlar negatif olamaz',
        error: 'INVALID_PRICE'
      });
    }

    // Yeni ürünler sıfır stokla oluşturulur; stok değişiklikleri hareketler üzerinden yapılır.
    const newProduct = await prisma.product.create({
      data: {
        urunKodu,
        kategori,
        alisFiyati: parseFloat(alisFiyati),
        listeFiyati: parseFloat(listeFiyati),
        mevcutMiktar: 0
      }
    });

    res.status(201).json({
      success: true,
      message: 'Ürün başarıyla oluşturuldu',
      data: { product: newProduct }
    });

  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Ürün oluşturulurken hata oluştu',
      error: 'INTERNAL_ERROR'
    });
  }
};

/**
 * Ürün güncelle
 * PUT /api/products/:id
 */
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { urunKodu, kategori, alisFiyati, listeFiyati, mevcutMiktar } = req.body;

    // Ürünün var olup olmadığını kontrol et
    const existingProduct = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Ürün bulunamadı',
        error: 'PRODUCT_NOT_FOUND'
      });
    }

    if (mevcutMiktar !== undefined) {
      return res.status(400).json({
        success: false,
        message: 'Stok miktarı ürün güncelleme endpointinden değiştirilemez; stok hareketi kullanın',
        error: 'STOCK_UPDATE_REQUIRES_MOVEMENT'
      });
    }

    // Ürün kodu benzersizliğini kontrol et (eğer değiştiriliyorsa)
    if (urunKodu && urunKodu !== existingProduct.urunKodu) {
      const duplicateProduct = await prisma.product.findUnique({
        where: { urunKodu }
      });

      if (duplicateProduct) {
        return res.status(409).json({
          success: false,
          message: 'Bu ürün kodu zaten kullanılıyor',
          error: 'PRODUCT_CODE_EXISTS'
        });
      }
    }

    // Fiyat validasyonu
    if (alisFiyati !== undefined && alisFiyati < 0) {
      return res.status(400).json({
        success: false,
        message: 'Alış fiyatı negatif olamaz',
        error: 'INVALID_PRICE'
      });
    }

    if (listeFiyati !== undefined && listeFiyati < 0) {
      return res.status(400).json({
        success: false,
        message: 'Liste fiyatı negatif olamaz',
        error: 'INVALID_PRICE'
      });
    }

    // Güncelleme verilerini hazırla. Stok miktarı yalnız hareketler üzerinden değişir.
    const updateData = {};
    if (urunKodu !== undefined) updateData.urunKodu = urunKodu;
    if (kategori !== undefined) updateData.kategori = kategori;
    if (alisFiyati !== undefined) updateData.alisFiyati = parseFloat(alisFiyati);
    if (listeFiyati !== undefined) updateData.listeFiyati = parseFloat(listeFiyati);

    // Ürünü güncelle
    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    res.json({
      success: true,
      message: 'Ürün başarıyla güncellendi',
      data: { product: updatedProduct }
    });

  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Ürün güncellenirken hata oluştu',
      error: 'INTERNAL_ERROR'
    });
  }
};

/**
 * Ürün sil
 * DELETE /api/products/:id
 */
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Ürünün var olup olmadığını kontrol et
    const existingProduct = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        stockMovements: true
      }
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Ürün bulunamadı',
        error: 'PRODUCT_NOT_FOUND'
      });
    }

    // Stok hareketleri varsa uyarı ver
    if (existingProduct.stockMovements.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Bu ürünün stok hareketleri bulunuyor. Önce stok hareketlerini siliniz.',
        error: 'PRODUCT_HAS_MOVEMENTS'
      });
    }

    // Ürünü sil
    await prisma.product.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Ürün başarıyla silindi'
    });

  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Ürün silinirken hata oluştu',
      error: 'INTERNAL_ERROR'
    });
  }
};

/**
 * Ürün kategorilerini getir
 * GET /api/products/categories
 */
const getCategories = async (req, res) => {
  try {
    const categories = await prisma.product.findMany({
      select: { kategori: true },
      distinct: ['kategori'],
      orderBy: { kategori: 'asc' }
    });

    const categoryList = categories.map(item => item.kategori);

    res.json({
      success: true,
      data: { categories: categoryList }
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Kategoriler getirilirken hata oluştu',
      error: 'INTERNAL_ERROR'
    });
  }
};

/**
 * Ürün istatistiklerini getir
 * GET /api/products/stats
 */
const getProductStats = async (req, res) => {
  try {
    // Inventory value is calculated in PostgreSQL so Decimal prices are multiplied
    // and summed as exact fixed-point values before crossing the JSON boundary.
    const [summary] = await prisma.$queryRaw`
      SELECT
        COUNT(*) AS "totalProducts",
        COALESCE(SUM("mevcutMiktar"), 0)::bigint AS "totalStockQuantity",
        COALESCE(SUM("alisFiyati" * "mevcutMiktar"), 0)::numeric(20,2) AS "totalStockValue",
        COUNT(*) FILTER (WHERE "mevcutMiktar" > 0 AND "mevcutMiktar" <= 10) AS "lowStockProducts"
      FROM "Product"
    `;

    const categoryStats = await prisma.product.groupBy({
      by: ['kategori'],
      _count: {
        id: true
      },
      _sum: {
        mevcutMiktar: true
      }
    });

    res.json({
      success: true,
      data: {
        totalProducts: Number(summary.totalProducts),
        totalStockQuantity: Number(summary.totalStockQuantity),
        totalStockValue: summary.totalStockValue,
        lowStockProducts: Number(summary.lowStockProducts),
        categoryStats
      }
    });

  } catch (error) {
    console.error('Get product stats error:', error);
    res.status(500).json({
      success: false,
      message: 'İstatistikler getirilirken hata oluştu',
      error: 'INTERNAL_ERROR'
    });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  getProductStats
};
