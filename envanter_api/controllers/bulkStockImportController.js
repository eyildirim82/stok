const crypto = require('node:crypto');
const { PrismaClient, Prisma } = require('@prisma/client');
const { parseStockImportFile } = require('../services/stockImportParser');

const prisma = new PrismaClient();
const MAX_IMPORT_ROWS = 1000;

const importError = (statusCode, errorCode, message, details = undefined) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.errorCode = errorCode;
  error.details = details;
  return error;
};

const normalizeMovementType = (value) => String(value ?? '')
  .trim()
  .toLocaleUpperCase('tr-TR')
  .replaceAll('İ', 'I')
  .replaceAll('Ş', 'S')
  .replaceAll('Ç', 'C')
  .replaceAll('Ğ', 'G')
  .replaceAll('Ü', 'U')
  .replaceAll('Ö', 'O');

const normalizeDate = (value) => {
  if (value === '' || value === null || value === undefined) return new Date();
  if (value instanceof Date) return value;
  return new Date(value);
};

const validateRows = async (rows) => {
  const errors = [];
  const normalizedRows = rows.map((row) => {
    const urunKodu = String(row.urunKodu ?? '').trim();
    const movementType = normalizeMovementType(row.hareketTipi);
    const quantity = Number(row.miktar);
    const faturaNo = String(row.faturaNo ?? '').trim();
    const movementDate = normalizeDate(row.hareketTarihi);

    if (!urunKodu) {
      errors.push({
        row: row.rowNumber,
        field: 'urunKodu',
        code: 'REQUIRED',
        message: 'Ürün kodu zorunludur',
      });
    }

    if (!['GIRIS', 'CIKIS'].includes(movementType)) {
      errors.push({
        row: row.rowNumber,
        field: 'hareketTipi',
        code: 'INVALID_MOVEMENT_TYPE',
        message: 'Hareket tipi GIRIS veya CIKIS olmalıdır',
      });
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      errors.push({
        row: row.rowNumber,
        field: 'miktar',
        code: 'INVALID_QUANTITY',
        message: 'Miktar pozitif bir tam sayı olmalıdır',
      });
    }

    if (faturaNo.length > 120) {
      errors.push({
        row: row.rowNumber,
        field: 'faturaNo',
        code: 'VALUE_TOO_LONG',
        message: 'Fatura numarası en fazla 120 karakter olabilir',
      });
    }

    if (Number.isNaN(movementDate.getTime())) {
      errors.push({
        row: row.rowNumber,
        field: 'hareketTarihi',
        code: 'INVALID_MOVEMENT_DATE',
        message: 'Geçersiz hareket tarihi',
      });
    }

    return {
      rowNumber: row.rowNumber,
      urunKodu,
      movementType,
      quantity,
      faturaNo: faturaNo || null,
      movementDate,
    };
  });

  if (errors.length > 0) return { errors, rows: normalizedRows };

  const productCodes = [...new Set(normalizedRows.map((row) => row.urunKodu))];
  const products = await prisma.product.findMany({
    where: { urunKodu: { in: productCodes } },
    select: { id: true, urunKodu: true },
  });
  const productsByCode = new Map(products.map((product) => [product.urunKodu, product]));

  for (const row of normalizedRows) {
    const product = productsByCode.get(row.urunKodu);
    if (!product) {
      errors.push({
        row: row.rowNumber,
        field: 'urunKodu',
        code: 'PRODUCT_NOT_FOUND',
        message: `Ürün bulunamadı: ${row.urunKodu}`,
      });
    } else {
      row.productId = product.id;
    }
  }

  return { errors, rows: normalizedRows };
};

exports.importStockMovements = async (req, res) => {
  try {
    if (!req.file?.buffer) {
      return res.status(400).json({
        success: false,
        message: 'Yüklenecek dosya gerekli',
        error: 'IMPORT_FILE_REQUIRED',
      });
    }

    const digest = crypto.createHash('sha256').update(req.file.buffer).digest('hex');
    const previousImport = await prisma.stockImport.findUnique({ where: { sha256: digest } });
    if (previousImport) {
      return res.status(409).json({
        success: false,
        message: 'Bu dosya daha önce başarıyla işlendi',
        error: 'IMPORT_ALREADY_PROCESSED',
        data: {
          importId: previousImport.id,
          processed: previousImport.rowCount,
          importedAt: previousImport.createdAt,
        },
      });
    }

    let parsed;
    try {
      parsed = await parseStockImportFile(req.file.buffer, req.file.originalname);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Dosya okunamadı',
        error: error.code || 'INVALID_IMPORT_FILE',
        data: error.details,
      });
    }

    if (parsed.rows.length > MAX_IMPORT_ROWS) {
      return res.status(413).json({
        success: false,
        message: `Tek dosyada en fazla ${MAX_IMPORT_ROWS} hareket işlenebilir`,
        error: 'IMPORT_ROW_LIMIT_EXCEEDED',
      });
    }

    const validation = await validateRows(parsed.rows);
    if (validation.errors.length > 0) {
      return res.status(422).json({
        success: false,
        message: 'Dosyada doğrulama hataları var; hiçbir stok hareketi uygulanmadı',
        error: 'IMPORT_VALIDATION_FAILED',
        data: { errors: validation.errors },
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const stockImport = await tx.stockImport.create({
        data: {
          sha256: digest,
          fileName: req.file.originalname || 'upload',
          rowCount: validation.rows.length,
        },
      });

      for (const row of validation.rows) {
        if (row.movementType === 'CIKIS') {
          const updateResult = await tx.product.updateMany({
            where: {
              id: row.productId,
              mevcutMiktar: { gte: row.quantity },
            },
            data: {
              mevcutMiktar: { decrement: row.quantity },
            },
          });

          if (updateResult.count === 0) {
            const product = await tx.product.findUnique({
              where: { id: row.productId },
              select: { mevcutMiktar: true },
            });

            if (!product) {
              throw importError(422, 'IMPORT_VALIDATION_FAILED', 'Ürün bulunamadı', {
                errors: [{
                  row: row.rowNumber,
                  field: 'urunKodu',
                  code: 'PRODUCT_NOT_FOUND',
                  message: `Ürün bulunamadı: ${row.urunKodu}`,
                }],
              });
            }

            throw importError(409, 'IMPORT_INSUFFICIENT_STOCK', 'Yetersiz stok; import geri alındı', {
              errors: [{
                row: row.rowNumber,
                field: 'miktar',
                code: 'INSUFFICIENT_STOCK',
                message: `${row.urunKodu} için mevcut stok ${product.mevcutMiktar}, istenen çıkış ${row.quantity}`,
              }],
            });
          }
        } else {
          const updateResult = await tx.product.updateMany({
            where: { id: row.productId },
            data: { mevcutMiktar: { increment: row.quantity } },
          });

          if (updateResult.count === 0) {
            throw importError(422, 'IMPORT_VALIDATION_FAILED', 'Ürün bulunamadı', {
              errors: [{
                row: row.rowNumber,
                field: 'urunKodu',
                code: 'PRODUCT_NOT_FOUND',
                message: `Ürün bulunamadı: ${row.urunKodu}`,
              }],
            });
          }
        }

        await tx.stockMovement.create({
          data: {
            productId: row.productId,
            movementType: row.movementType,
            quantity: row.quantity,
            faturaNo: row.faturaNo,
            movementDate: row.movementDate,
            importId: stockImport.id,
            importRow: row.rowNumber,
          },
        });
      }

      return stockImport;
    });

    return res.status(201).json({
      success: true,
      message: 'Toplu stok hareketleri başarıyla işlendi',
      data: {
        importId: result.id,
        processed: result.rowCount,
        ignoredColumns: parsed.unknownHeaders,
      },
    });
  } catch (error) {
    if (error.statusCode && error.errorCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
        error: error.errorCode,
        data: error.details,
      });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'Bu dosya başka bir istek tarafından daha önce işlendi',
        error: 'IMPORT_ALREADY_PROCESSED',
      });
    }

    console.error('importStockMovements error:', error);
    return res.status(500).json({
      success: false,
      message: 'Toplu stok importu sırasında sunucu hatası oluştu',
      error: 'INTERNAL_ERROR',
    });
  }
};
