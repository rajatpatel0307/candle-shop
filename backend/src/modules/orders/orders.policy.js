import { AppError } from '../../common/errors/AppError.js';
import { ADMIN_ORDER_ROLES } from './orders.constants.js';

export function requireCustomer(req, res, next) {
  if (!req.user) return next(new AppError(401, 'AUTHENTICATION_REQUIRED', 'Authentication is required.'));
  return next();
}

export function requireOrderAdmin(req, res, next) {
  if (!req.user) return next(new AppError(401, 'AUTHENTICATION_REQUIRED', 'Authentication is required.'));
  if (!ADMIN_ORDER_ROLES.some((role) => req.user.roles?.includes(role))) {
    return next(new AppError(403, 'FORBIDDEN', 'Order administration requires ADMIN or SUPPORT role.'));
  }
  return next();
}
