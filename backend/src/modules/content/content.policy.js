import { AppError } from '../../common/errors/AppError.js';

export function requireContentAdmin(req, res, next) {
  if (!req.user) return next(new AppError(401, 'AUTHENTICATION_REQUIRED', 'Authentication is required.'));
  if (!req.user.roles?.some((role) => ['ADMIN', 'SUPPORT'].includes(role))) {
    return next(new AppError(403, 'FORBIDDEN', 'You do not have permission to manage content.'));
  }
  return next();
}
