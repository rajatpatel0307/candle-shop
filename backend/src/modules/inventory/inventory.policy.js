import { AppError } from '../../common/errors/AppError.js';

export function authorizeAnyRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return next(new AppError(401, 'AUTHENTICATION_REQUIRED', 'Authentication is required.'));
    if (!roles.some((role) => req.user.roles?.includes(role))) {
      return next(new AppError(403, 'FORBIDDEN', 'You do not have permission to manage inventory.'));
    }
    return next();
  };
}
