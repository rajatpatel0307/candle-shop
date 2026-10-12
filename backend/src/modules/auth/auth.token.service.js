import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';
import { env } from '../../config/env.js';
import { addDays, randomToken, tokenHash } from './auth.utils.js';

export function createAccessToken(user, sessionId) {
  const tokenId = randomUUID();
  return jwt.sign(
    {
      sub: user.id,
      sid: sessionId,
      jti: tokenId,
      roles: user.roles,
    },
    env.JWT_ACCESS_SECRET,
    {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN,
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE,
      algorithm: 'HS256',
    },
  );
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET, {
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE,
    algorithms: ['HS256'],
  });
}

export function createRefreshToken() {
  const token = randomToken(64);
  return {
    token,
    hash: tokenHash(token),
    expiresAt: addDays(new Date(), env.REFRESH_TOKEN_EXPIRES_DAYS),
  };
}

export function hashOpaqueToken(token) {
  return tokenHash(token);
}
