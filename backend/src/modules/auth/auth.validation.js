import { z } from 'zod';
import { passwordPolicyMessage } from './auth.constants.js';

const passwordSchema = z.string()
  .min(8, passwordPolicyMessage)
  .max(128)
  .regex(/[a-z]/, passwordPolicyMessage)
  .regex(/[A-Z]/, passwordPolicyMessage)
  .regex(/[0-9]/, passwordPolicyMessage)
  .regex(/[^A-Za-z0-9]/, passwordPolicyMessage);

export const registerSchema = z.object({
  firstName: z.string().trim().min(2).max(100),
  lastName: z.string().trim().max(100).optional().default(''),
  email: z.string().trim().email().max(320).transform((value) => value.toLowerCase()),
  phoneNumber: z.string().trim().max(30).optional(),
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: z.string().trim().email().max(320).transform((value) => value.toLowerCase()),
  password: z.string().min(1).max(128),
});

export const tokenSchema = z.object({
  token: z.string().min(32).max(500),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email().max(320).transform((value) => value.toLowerCase()),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(32).max(500),
  password: passwordSchema,
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword: passwordSchema,
});

export const sessionIdSchema = z.object({
  sessionId: z.string().uuid(),
});
