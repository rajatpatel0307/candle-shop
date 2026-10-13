import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  FRONTEND_ORIGINS: z.string().default('http://localhost:5173'),
  DB_DRIVER: z.enum(['tedious', 'msnodesqlv8']).default('tedious'),
  DB_CONNECTION_STRING: z.string().optional(),
  DB_SERVER: z.string().min(1),
  DB_PORT: z.coerce.number().int().positive().optional(),
  DB_NAME: z.string().min(1),
  DB_USER: z.string().optional(),
  DB_PASSWORD: z.string().optional(),
  DB_ENCRYPT: z.enum(['true', 'false']).default('false'),
  DB_TRUST_SERVER_CERTIFICATE: z.enum(['true', 'false']).default('true'),
  JWT_ACCESS_SECRET: z.string().default('dev-only-change-this-access-secret'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_ISSUER: z.string().default('candle-commerce-api'),
  JWT_AUDIENCE: z.string().default('candle-commerce-web'),
  REFRESH_TOKEN_EXPIRES_DAYS: z.coerce.number().int().positive().default(30),
  EMAIL_VERIFICATION_EXPIRES_MINUTES: z.coerce.number().int().positive().default(60),
  PASSWORD_RESET_EXPIRES_MINUTES: z.coerce.number().int().positive().default(30),
  BCRYPT_ROUNDS: z.coerce.number().int().min(10).max(14).default(12),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  EMAIL_FROM: z.string().default('Candle Commerce <no-reply@localhost>'),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
  LOG_LEVEL: z.string().default('info'),
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
}).superRefine((value, ctx) => {
  if (value.DB_DRIVER === 'tedious' && (!value.DB_USER || !value.DB_PASSWORD)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['DB_USER'],
      message: 'DB_USER and DB_PASSWORD are required when DB_DRIVER=tedious.',
    });
  }
  if (value.NODE_ENV === 'production' && value.JWT_ACCESS_SECRET === 'dev-only-change-this-access-secret') {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['JWT_ACCESS_SECRET'],
      message: 'JWT_ACCESS_SECRET must be set in production.',
    });
  }
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid environment configuration:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export const frontendOrigins = env.FRONTEND_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean);
