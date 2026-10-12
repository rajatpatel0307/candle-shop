import { z } from 'zod';

export const passwordSchema = z.string()
  .min(8, 'Use at least 8 characters.')
  .regex(/[a-z]/, 'Add a lowercase letter.')
  .regex(/[A-Z]/, 'Add an uppercase letter.')
  .regex(/[0-9]/, 'Add a number.')
  .regex(/[^A-Za-z0-9]/, 'Add a symbol.');

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email.'),
  password: z.string().min(1, 'Password is required.'),
});

export const registerSchema = z.object({
  firstName: z.string().min(2, 'First name is required.'),
  lastName: z.string().optional(),
  email: z.string().email('Enter a valid email.'),
  phoneNumber: z.string().optional(),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  path: ['confirmPassword'],
  message: 'Passwords do not match.',
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Enter a valid email.'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10, 'Reset token is required.'),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  path: ['confirmPassword'],
  message: 'Passwords do not match.',
});
