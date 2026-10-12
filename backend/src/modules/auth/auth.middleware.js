import { AppError } from '../../common/errors/AppError.js';
import { ACCESS_COOKIE } from './auth.constants.js';
import { verifyAccessToken } from './auth.token.service.js';

export function authenticate(req, res, next) {
  const header = req.headers.authorization;
  const bearer = header?.startsWith('Bearer ') ? header.slice(7) : null;
  const token = bearer || req.cookies?.[ACCESS_COOKIE];

  if (!token) return next(new AppError(401, 'AUTHENTICATION_REQUIRED', 'Authentication is required.'));

  try {
    const payload = verifyAccessToken(token);
    req.user = {
      id: payload.sub,
      sessionId: payload.sid,
      roles: payload.roles || [],
      tokenId: payload.jti,
    };
    return next();
  } catch {
    return next(new AppError(401, 'INVALID_ACCESS_TOKEN', 'Access token is invalid or expired.'));
  }
}

export function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) return next(new AppError(401, 'AUTHENTICATION_REQUIRED', 'Authentication is required.'));
    if (!roles.some((role) => req.user.roles.includes(role))) {
      return next(new AppError(403, 'FORBIDDEN', 'You do not have permission to access this resource.'));
    }
    return next();
  };
}

export function requireVerifiedEmail(req, res, next) {
  if (!req.authenticatedUser?.isEmailVerified) {
    return next(new AppError(403, 'EMAIL_VERIFICATION_REQUIRED', 'Please verify your email before continuing.'));
  }
  return next();
}
