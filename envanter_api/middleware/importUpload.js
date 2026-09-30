const multer = require('multer');

const MAX_IMPORT_FILE_BYTES = 5 * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    files: 1,
    fileSize: MAX_IMPORT_FILE_BYTES,
  },
});

const stockImportUpload = (req, res, next) => {
  upload.single('file')(req, res, (error) => {
    if (!error) return next();

    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          success: false,
          message: 'Import dosyası en fazla 5 MB olabilir',
          error: 'IMPORT_FILE_TOO_LARGE',
        });
      }

      return res.status(400).json({
        success: false,
        message: 'Dosya yükleme isteği geçersiz',
        error: 'INVALID_MULTIPART_UPLOAD',
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Dosya yüklenemedi',
      error: 'UPLOAD_FAILED',
    });
  });
};

module.exports = {
  stockImportUpload,
};
