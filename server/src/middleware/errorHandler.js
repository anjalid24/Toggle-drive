import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';

export function notFound(req, res, next) {
  next(ApiError.notFound());
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  // Normalise well-known non-ApiError failures.
  if (err.code === 'LIMIT_FILE_SIZE') {
    err = ApiError.payloadTooLarge('File exceeds the maximum upload size');
  } else if (err.code === 11000) {
    err = ApiError.conflict('Resource already exists');
  } else if (err.name === 'ValidationError') {
    err = ApiError.badRequest(err.message);
  } else if (err.name === 'CastError') {
    err = ApiError.badRequest('Invalid identifier');
  }

  const status = err.status || 500;
  if (status >= 500) {
    logger.error(err.stack || err.message);
  }

  res.status(status).json({
    error: status === 500 ? 'Internal server error' : err.message,
  });
}
