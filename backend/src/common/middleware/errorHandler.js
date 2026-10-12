export function errorHandler(error, req, res, next) {
  const status = Number.isInteger(error.statusCode) ? error.statusCode : 500;
  const isOperationalError = error.name === 'AppError';

  if (status >= 500 && !isOperationalError) {
    console.error(`[error] ${req.method} ${req.originalUrl} -> ${error.message}`);
  } else if (status >= 500) {
    console.warn(`[warn] ${req.method} ${req.originalUrl} -> ${error.message}`);
  }

  res.status(status).json({
    error: {
      code: error.code || 'INTERNAL_ERROR',
      message: status >= 500 && !isOperationalError ? 'An unexpected error occurred.' : error.message,
      ...(error.details ? { details: error.details } : {}),
      requestId: req.id,
    },
  });
}
