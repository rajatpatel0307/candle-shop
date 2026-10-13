import { AppError } from '../../common/errors/AppError.js';

export function requireCustomer(req, res, next) {
  if (!req.user) return next(new AppError(401, 'AUTHENTICATION_REQUIRED', 'Authentication is required.'));
  return next();
}

export function requireReviewAdmin(req, res, next) {
  if (!req.user?.roles?.some((role) => ['ADMIN', 'SUPPORT'].includes(role))) {
    return next(new AppError(403, 'FORBIDDEN', 'Review moderation requires ADMIN or SUPPORT role.'));
  }
  return next();
}
