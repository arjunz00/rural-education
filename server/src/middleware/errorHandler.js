export const errorHandler = (err, req, res, next) => {
  console.error('[Error]', err.stack || err.message);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: messages
    });
  }

  // Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({
      success: false,
      error: `Duplicate entry for ${field}. Value already exists.`,
      field
    });
  }

  // CastError (e.g. invalid ObjectId or number)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: `Resource not found with format: ${err.path}`
    });
  }

  // Default internal server error
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
};
