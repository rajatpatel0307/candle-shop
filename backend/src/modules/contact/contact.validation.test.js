import test from 'node:test';
import assert from 'node:assert/strict';
import { contactCreateSchema } from './contact.validation.js';

test('contactCreateSchema validates contact form', () => {
  const parsed = contactCreateSchema.parse({ name: 'Raj', email: 'raj@example.com', subject: 'Help', message: 'I need help with an order.' });
  assert.equal(parsed.email, 'raj@example.com');
});
