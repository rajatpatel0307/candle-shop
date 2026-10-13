import { AppError } from '../../common/errors/AppError.js';
import { ADMIN_ROLES } from './admin.constants.js';

export function requireAdminAccess(req, res, next) {
  if (!req.user) return next(new AppError(401, 'AUTHENTICATION_REQUIRED', 'Authentication is required.'));
  if (!ADMIN_ROLES.some((role) => req.user.roles?.includes(role))) {
    return next(new AppError(403, 'FORBIDDEN', 'Administrative access is required.'));
  }
  return next();
}

export function requireAdminOnly(req, res, next) {
  if (!req.user?.roles?.includes('ADMIN')) {
    return next(new AppError(403, 'FORBIDDEN', 'This action requires ADMIN role.'));
  }
  return next();
}
