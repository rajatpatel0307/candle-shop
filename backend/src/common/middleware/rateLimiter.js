import rateLimit from 'express-rate-limit';

export const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 1200,
  // Login has its own failed-attempt limits. Store browsing must not lock out sign-in.
  skip: (req) => req.method === 'POST' && /^\/auth\/login\/?$/i.test(req.path),
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: { code: 'RATE_LIMITED', message: 'Too many requests. Please try again later.' } },
});
