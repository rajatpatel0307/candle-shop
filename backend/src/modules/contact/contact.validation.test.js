import test from 'node:test';
import assert from 'node:assert/strict';
import { contactCreateSchema, listContactSchema } from './contact.validation.js';

test('contactCreateSchema validates contact form', () => {
  const parsed = contactCreateSchema.parse({ name: 'Raj', email: 'raj@example.com', subject: 'Help', message: 'I need help with an order.' });
  assert.equal(parsed.email, 'raj@example.com');
});

test('contact search is bounded and sorting accepts only supported directions', () => {
  assert.deepEqual(listContactSchema.parse({ search: '  candle  ', sort: 'oldest' }), { page: 1, limit: 20, search: 'candle', sort: 'oldest' });
  assert.equal(listContactSchema.parse({}).sort, 'newest');
  assert.equal(listContactSchema.safeParse({ search: 'x'.repeat(201) }).success, false);
  assert.equal(listContactSchema.safeParse({ sort: 'CreatedAtUtc; DROP TABLE' }).success, false);
});
