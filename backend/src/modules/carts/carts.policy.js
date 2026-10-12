import { AppError } from '../../common/errors/AppError.js';

export function requireCustomer(req, res, next) {
  if (!req.user) return next(new AppError(401, 'AUTHENTICATION_REQUIRED', 'Authentication is required.'));
  return next();
}
