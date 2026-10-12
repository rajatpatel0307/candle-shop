import crypto from 'node:crypto';

export function normalizeUser(row) {
  if (!row) return null;
  return {
    id: row.UserId,
    firstName: row.FirstName,
    lastName: row.LastName,
    email: row.Email,
    phoneNumber: row.PhoneNumber,
    accountStatus: row.AccountStatus,
    isEmailVerified: Boolean(row.EmailVerifiedAtUtc),
    lastLoginAtUtc: row.LastLoginAtUtc,
    roles: row.Roles ? row.Roles.split(',').filter(Boolean) : [],
  };
}

export function randomToken(bytes = 48) {
  return crypto.randomBytes(bytes).toString('base64url');
}

export function tokenHash(token) {
  return crypto.createHash('sha256').update(token).digest();
}

export function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

export function addDays(date, days) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

export function getClientIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || null;
}
