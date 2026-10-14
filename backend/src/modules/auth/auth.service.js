import bcrypt from 'bcrypt';
import { randomInt, randomUUID } from 'node:crypto';
import { env } from '../../config/env.js';
import { AppError } from '../../common/errors/AppError.js';
import * as repo from './auth.repository.js';
import { createAccessToken, createRefreshToken, hashOpaqueToken } from './auth.token.service.js';
import { addMinutes, getClientIp, normalizeUser, randomToken, tokenHash } from './auth.utils.js';
import { sendPasswordResetEmail, sendVerificationEmail } from './auth.email.service.js';

function assertActive(user) {
  if (!user || user.AccountStatus === 'Closed' || user.IsDeleted) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password.');
  }
  if (user.AccountStatus === 'Pending') {
    throw new AppError(403, 'EMAIL_VERIFICATION_REQUIRED', 'Please verify your email before logging in.');
  }
  if (user.AccountStatus === 'Suspended') {
    throw new AppError(403, 'ACCOUNT_SUSPENDED', 'This account is suspended.');
  }
  if (user.LockedUntilUtc && new Date(user.LockedUntilUtc) > new Date()) {
    throw new AppError(423, 'ACCOUNT_LOCKED', 'This account is temporarily locked.');
  }
}

async function issueSession(user, req) {
  const sessionId = randomUUID();
  const refresh = createRefreshToken();
  await repo.createRefreshToken({
    userId: user.id,
    sessionId,
    tokenHashValue: refresh.hash,
    expiresAt: refresh.expiresAt,
    ip: getClientIp(req),
    userAgent: req.headers['user-agent'] || null,
  });
  return {
    accessToken: createAccessToken(user, sessionId),
    refreshToken: refresh.token,
    user,
  };
}

function createVerificationOtp() {
  return String(randomInt(100000, 1000000));
}

export async function register(input, req) {
  const existing = await repo.findUserByEmail(input.email);
  if (existing) throw new AppError(409, 'EMAIL_ALREADY_REGISTERED', 'An account already exists for this email.');

  const passwordHash = await bcrypt.hash(input.password, env.BCRYPT_ROUNDS);
  const row = await repo.createCustomerUser({ ...input, passwordHash });
  const user = normalizeUser(row);

  const otp = createVerificationOtp();
  await repo.createEmailVerificationToken(
    user.id,
    tokenHash(otp),
    addMinutes(new Date(), env.EMAIL_VERIFICATION_EXPIRES_MINUTES),
  );
  await sendVerificationEmail(user, otp);

  return { user, email: user.email };
}

export async function login({ email, password }, req) {
  const row = await repo.findUserByEmail(email);
  assertActive(row);

  const valid = await bcrypt.compare(password, row.PasswordHash);
  if (!valid) {
    const failedCount = Number(row.FailedLoginCount || 0) + 1;
    const lockUntil = failedCount >= 5 ? addMinutes(new Date(), 15) : null;
    await repo.updateLoginFailure(row.UserId, failedCount, lockUntil);
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password.');
  }

  await repo.updateLoginSuccess(row.UserId);
  return issueSession(normalizeUser(row), req);
}

export async function me(userId) {
  const row = await repo.findUserById(userId);
  if (!row) throw new AppError(404, 'USER_NOT_FOUND', 'User was not found.');
  return normalizeUser(row);
}

export async function verifyEmail(token) {
  const consumed = await repo.consumeEmailVerificationToken(hashOpaqueToken(token));
  if (!consumed) throw new AppError(400, 'INVALID_OR_EXPIRED_TOKEN', 'Verification token is invalid or expired.');
  await repo.markEmailVerified(consumed.UserId);
  return { verified: true };
}

export async function verifyEmailOtp(input, req) {
  const consumed = await repo.consumeEmailVerificationOtp(input.email, tokenHash(input.otp));
  if (!consumed) throw new AppError(400, 'INVALID_OR_EXPIRED_OTP', 'Verification code is invalid or expired.');
  await repo.markEmailVerified(consumed.UserId);
  const row = await repo.findUserById(consumed.UserId);
  return issueSession(normalizeUser(row), req);
}

export async function resendVerification(email) {
  const row = await repo.findUserByEmail(email);
  if (!row || row.EmailVerifiedAtUtc) return;
  const user = normalizeUser(row);
  const otp = createVerificationOtp();
  await repo.createEmailVerificationToken(
    user.id,
    tokenHash(otp),
    addMinutes(new Date(), env.EMAIL_VERIFICATION_EXPIRES_MINUTES),
  );
  await sendVerificationEmail(user, otp);
}

export async function forgotPassword(email) {
  const row = await repo.findUserByEmail(email);
  if (!row) return;
  const user = normalizeUser(row);
  const token = randomToken();
  await repo.createPasswordResetToken(
    user.id,
    tokenHash(token),
    addMinutes(new Date(), env.PASSWORD_RESET_EXPIRES_MINUTES),
  );
  await sendPasswordResetEmail(user, token);
}

export async function resetPassword({ token, password }) {
  const consumed = await repo.consumePasswordResetToken(hashOpaqueToken(token));
  if (!consumed) throw new AppError(400, 'INVALID_OR_EXPIRED_TOKEN', 'Password reset token is invalid or expired.');
  const passwordHash = await bcrypt.hash(password, env.BCRYPT_ROUNDS);
  await repo.setPasswordHash(consumed.UserId, passwordHash);
  await repo.revokeAllSessions(consumed.UserId);
}

export async function changePassword(userId, { currentPassword, newPassword }) {
  const row = await repo.findUserById(userId);
  if (!row) throw new AppError(404, 'USER_NOT_FOUND', 'User was not found.');
  const valid = await bcrypt.compare(currentPassword, row.PasswordHash);
  if (!valid) throw new AppError(400, 'INVALID_CURRENT_PASSWORD', 'Current password is incorrect.');
  const passwordHash = await bcrypt.hash(newPassword, env.BCRYPT_ROUNDS);
  await repo.setPasswordHash(userId, passwordHash);
  await repo.revokeAllSessions(userId);
}

export async function refresh(refreshToken, req) {
  if (!refreshToken) throw new AppError(401, 'REFRESH_TOKEN_REQUIRED', 'Refresh token is required.');
  const stored = await repo.findRefreshToken(hashOpaqueToken(refreshToken));
  if (!stored || stored.RevokedAtUtc || new Date(stored.ExpiresAtUtc) <= new Date()) {
    if (stored?.SessionId) await repo.revokeSession(stored.UserId, stored.SessionId);
    throw new AppError(401, 'INVALID_REFRESH_TOKEN', 'Refresh token is invalid or expired.');
  }

  const row = await repo.findUserById(stored.UserId);
  assertActive(row);
  const user = normalizeUser(row);
  const next = createRefreshToken();
  const nextTokenId = randomUUID();
  await repo.rotateRefreshToken({
    oldTokenId: stored.RefreshTokenId,
    newTokenId: nextTokenId,
    userId: user.id,
    sessionId: stored.SessionId,
    tokenHashValue: next.hash,
    expiresAt: next.expiresAt,
    ip: getClientIp(req),
    userAgent: req.headers['user-agent'] || null,
  });
  return {
    accessToken: createAccessToken(user, nextTokenId),
    refreshToken: next.token,
    user,
  };
}

export async function logout(refreshToken) {
  if (refreshToken) await repo.revokeRefreshToken(hashOpaqueToken(refreshToken));
}

export async function logoutAll(userId) {
  await repo.revokeAllSessions(userId);
}

export async function sessions(userId) {
  return repo.listSessions(userId);
}

export async function revokeSession(userId, sessionId) {
  const revoked = await repo.revokeSession(userId, sessionId);
  if (!revoked) throw new AppError(404, 'SESSION_NOT_FOUND', 'Session was not found.');
}
