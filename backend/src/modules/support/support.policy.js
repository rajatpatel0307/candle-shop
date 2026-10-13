import { AppError } from '../../common/errors/AppError.js';
export function requireSupportAdmin(req, res, next) {
  if (!req.user?.roles?.some((role) => ['ADMIN', 'SUPPORT'].includes(role))) return next(new AppError(403, 'FORBIDDEN', 'Support administration requires ADMIN or SUPPORT role.'));
  return next();
}
