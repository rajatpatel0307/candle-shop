import { AppError } from '../../common/errors/AppError.js';
import { REFUND_ADMIN_ROLES } from './refunds.constants.js';

export function requireRefundAdmin(req, res, next) {
  if (!req.user) return next(new AppError(401, 'AUTHENTICATION_REQUIRED', 'Authentication is required.'));
  if (!REFUND_ADMIN_ROLES.some((role) => req.user.roles?.includes(role))) {
    return next(new AppError(403, 'FORBIDDEN', 'Refund operations require ADMIN or SUPPORT role.'));
  }
  return next();
}
