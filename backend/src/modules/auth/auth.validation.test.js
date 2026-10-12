import test from 'node:test';
import assert from 'node:assert/strict';
import { loginSchema, registerSchema, resetPasswordSchema } from './auth.validation.js';

test('registerSchema accepts a valid customer registration payload', () => {
  const result = registerSchema.safeParse({
    firstName: 'Rajat',
    lastName: 'Patel',
    email: 'RAJAT@example.com',
    password: 'Strong@123',
  });

  assert.equal(result.success, true);
  assert.equal(result.data.email, 'rajat@example.com');
});

test('registerSchema rejects weak passwords', () => {
  const result = registerSchema.safeParse({
    firstName: 'Rajat',
    email: 'rajat@example.com',
    password: 'password',
  });

  assert.equal(result.success, false);
});

test('loginSchema normalizes email', () => {
  const result = loginSchema.parse({ email: 'USER@Example.COM', password: 'x' });
  assert.equal(result.email, 'user@example.com');
});

test('resetPasswordSchema requires secure password', () => {
  const result = resetPasswordSchema.safeParse({ token: 'abcdefghijklmnopqrstuvwxyz123456', password: 'short' });
  assert.equal(result.success, false);
});
