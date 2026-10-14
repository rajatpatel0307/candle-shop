import { REFRESH_COOKIE } from './auth.constants.js';
import { clearAuthCookies, setAuthCookies } from './auth.policy.js';
import * as service from './auth.service.js';
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  sessionIdSchema,
  tokenSchema,
  verifyEmailSchema,
} from './auth.validation.js';

function validate(schema, data) {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    const error = new Error('Validation failed.');
    error.statusCode = 400;
    error.code = 'VALIDATION_ERROR';
    error.details = parsed.error.flatten();
    throw error;
  }
  return parsed.data;
}

function ok(res, message, data = undefined) {
  res.json({ success: true, message, ...(data ? { data } : {}) });
}

export async function register(req, res) {
  const result = await service.register(validate(registerSchema, req.body), req);
  ok(res.status(201), 'Registration started. Please enter the OTP sent to your email.', { email: result.email, user: result.user });
}

export async function login(req, res) {
  const result = await service.login(validate(loginSchema, req.body), req);
  setAuthCookies(res, result);
  ok(res, 'Login successful.', { user: result.user });
}

export async function refresh(req, res) {
  const result = await service.refresh(req.cookies?.[REFRESH_COOKIE], req);
  setAuthCookies(res, result);
  ok(res, 'Session refreshed.', { user: result.user });
}

export async function logout(req, res) {
  await service.logout(req.cookies?.[REFRESH_COOKIE]);
  clearAuthCookies(res);
  ok(res, 'Logged out.');
}

export async function logoutAll(req, res) {
  await service.logoutAll(req.user.id);
  clearAuthCookies(res);
  ok(res, 'All sessions logged out.');
}

export async function me(req, res) {
  ok(res, 'Authenticated user loaded.', { user: await service.me(req.user.id) });
}

export async function verifyEmail(req, res) {
  if (req.body?.token) {
    await service.verifyEmail(validate(tokenSchema, req.body).token);
    ok(res, 'Email verified.');
    return;
  }

  const result = await service.verifyEmailOtp(validate(verifyEmailSchema, req.body), req);
  setAuthCookies(res, result);
  ok(res, 'Email verified.', { user: result.user });
}

export async function resendVerification(req, res) {
  const { email } = validate(forgotPasswordSchema, req.body);
  await service.resendVerification(email);
  ok(res, 'If the account exists and needs verification, an email has been sent.');
}

export async function forgotPassword(req, res) {
  const { email } = validate(forgotPasswordSchema, req.body);
  await service.forgotPassword(email);
  ok(res, 'If the account exists, password reset instructions have been sent.');
}

export async function resetPassword(req, res) {
  await service.resetPassword(validate(resetPasswordSchema, req.body));
  clearAuthCookies(res);
  ok(res, 'Password reset successful. Please log in again.');
}

export async function changePassword(req, res) {
  await service.changePassword(req.user.id, validate(changePasswordSchema, req.body));
  clearAuthCookies(res);
  ok(res, 'Password changed. Please log in again.');
}

export async function sessions(req, res) {
  ok(res, 'Sessions loaded.', { sessions: await service.sessions(req.user.id) });
}

export async function revokeSession(req, res) {
  const { sessionId } = validate(sessionIdSchema, req.params);
  await service.revokeSession(req.user.id, sessionId);
  ok(res, 'Session revoked.');
}
