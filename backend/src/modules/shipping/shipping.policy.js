import { AppError } from '../../common/errors/AppError.js';
import { SHIPPING_ADMIN_ROLES } from './shipping.constants.js';

export function requireShippingAdmin(req, res, next) {
  if (!req.user) return next(new AppError(401, 'AUTHENTICATION_REQUIRED', 'Authentication is required.'));
  if (!SHIPPING_ADMIN_ROLES.some((role) => req.user.roles?.includes(role))) {
    return next(new AppError(403, 'FORBIDDEN', 'Shipping operations require ADMIN or SUPPORT role.'));
  }
  return next();
}
