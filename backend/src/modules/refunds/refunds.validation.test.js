import test from 'node:test';
import assert from 'node:assert/strict';
import { createRefundSchema } from './refunds.validation.js';

test('createRefundSchema accepts partial refund request', () => {
  const parsed = createRefundSchema.parse({ amount: 100, reason: 'Customer cancellation' });
  assert.equal(parsed.amount, 100);
});

test('createRefundSchema requires a reason', () => {
  const result = createRefundSchema.safeParse({ amount: 100 });
  assert.equal(result.success, false);
});
