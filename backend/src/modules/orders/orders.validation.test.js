import test from 'node:test';
import assert from 'node:assert/strict';
import { cancellationSchema, statusUpdateSchema } from './orders.validation.js';

test('statusUpdateSchema accepts a valid order transition payload', () => {
  const parsed = statusUpdateSchema.parse({ status: 'PROCESSING', reason: 'Packing started' });
  assert.equal(parsed.status, 'PROCESSING');
});

test('cancellationSchema requires a useful reason', () => {
  const result = cancellationSchema.safeParse({ reason: 'no' });
  assert.equal(result.success, false);
});
