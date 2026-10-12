import { env } from '../../config/env.js';
import { ACCESS_COOKIE, REFRESH_COOKIE } from './auth.constants.js';

function cookieBase(path = '/api/v1') {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'strict' : 'lax',
    path,
  };
}

export function setAuthCookies(res, { accessToken, refreshToken }) {
  res.cookie(ACCESS_COOKIE, accessToken, {
    ...cookieBase('/api/v1'),
    maxAge: 15 * 60 * 1000,
  });
  res.cookie(REFRESH_COOKIE, refreshToken, {
    ...cookieBase('/api/v1/auth'),
    maxAge: env.REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
  });
}

export function clearAuthCookies(res) {
  res.clearCookie(ACCESS_COOKIE, cookieBase('/api/v1'));
  res.clearCookie(REFRESH_COOKIE, cookieBase('/api/v1/auth'));
}
