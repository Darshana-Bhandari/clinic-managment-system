import multer from 'multer';

/**
 * Centralized Multer error handler middleware.
 * Must be used AFTER the multer upload middleware in the route.
 */
export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        message: 'File too large. Maximum file size is 10MB.',
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files uploaded.',
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: `Unexpected file field: "${err.field}". Use the correct field name.`,
      });
    }
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`,
    });
  }

  // Custom filter errors (from fileFilter callbacks)
  if (
    err &&
    err.message &&
    (err.message.includes('Only image') ||
      err.message.includes('Only images, PDFs') ||
      err.message.includes('allowed'))
  ) {
    return res.status(415).json({
      success: false,
      message: err.message,
    });
  }

  // Pass other errors down the chain
  next(err);
};