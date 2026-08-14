const logger = require('../config/logger');
const { AppError } = require('../utils/responseFormatter');

function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let code = err.code || 'INTERNAL_SERVER_ERROR';
  let message = err.message || 'An unexpected error occurred';

  if (err.name === 'ValidationError' || err.name === 'ZodError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = err.errors ? err.errors.map(e => e.message).join(', ') : err.message;
  } else if (err.code === 'P2002') {
    // Prisma unique constraint error
    statusCode = 409;
    code = 'DUPLICATE_RESOURCE';
    message = 'A resource with that unique key already exists';
  } else if (err.code === 'P2025') {
    statusCode = 404;
    code = 'RESOURCE_NOT_FOUND';
    message = 'Record to update or delete not found';
  }

  logger.error(`[API Error] ${req.method} ${req.originalUrl} - ${statusCode} [${code}]: ${message}`, {
    stack: err.stack,
  });

  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
    },
  });
}

module.exports = errorHandler;
