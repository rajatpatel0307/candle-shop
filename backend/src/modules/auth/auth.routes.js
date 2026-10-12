import { Router } from 'express';
import { asyncHandler } from '../../common/middleware/asyncHandler.js';
import { authenticate } from './auth.middleware.js';
import {
  changePassword,
  forgotPassword,
  login,
  logout,
  logoutAll,
  me,
  refresh,
  register,
  resendVerification,
  resetPassword,
  revokeSession,
  sessions,
  verifyEmail,
} from './auth.controller.js';
import { authRateLimit, loginRateLimit, passwordResetRateLimit } from './auth.rateLimit.js';

const router = Router();

router.post('/register', authRateLimit, asyncHandler(register));
router.post('/verify-email', authRateLimit, asyncHandler(verifyEmail));
router.post('/resend-verification', authRateLimit, asyncHandler(resendVerification));
router.post('/login', loginRateLimit, asyncHandler(login));
router.post('/refresh', authRateLimit, asyncHandler(refresh));
router.post('/logout', authRateLimit, asyncHandler(logout));
router.post('/forgot-password', passwordResetRateLimit, asyncHandler(forgotPassword));
router.post('/reset-password', passwordResetRateLimit, asyncHandler(resetPassword));

router.get('/me', authenticate, asyncHandler(me));
router.post('/logout-all', authenticate, asyncHandler(logoutAll));
router.post('/change-password', authenticate, passwordResetRateLimit, asyncHandler(changePassword));
router.get('/sessions', authenticate, asyncHandler(sessions));
router.delete('/sessions/:sessionId', authenticate, asyncHandler(revokeSession));

export default router;
