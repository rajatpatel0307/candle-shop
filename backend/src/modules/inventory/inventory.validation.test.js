import test from 'node:test';
import assert from 'node:assert/strict';
import {
  adjustmentSchema,
  createReservationSchema,
  listInventorySchema,
  receiptSchema,
} from './inventory.validation.js';

test('listInventorySchema applies safe defaults', () => {
  const parsed = listInventorySchema.parse({});
  assert.equal(parsed.page, 1);
  assert.equal(parsed.limit, 20);
  assert.equal(parsed.status, 'all');
});

test('receiptSchema requires a positive quantity', () => {
  assert.equal(receiptSchema.safeParse({ quantity: 5 }).success, true);
  assert.equal(receiptSchema.safeParse({ quantity: 0 }).success, false);
});

test('adjustmentSchema requires a reason', () => {
  assert.equal(adjustmentSchema.safeParse({ type: 'OUT', quantity: 1, reason: 'damaged jar' }).success, true);
  assert.equal(adjustmentSchema.safeParse({ type: 'OUT', quantity: 1, reason: '' }).success, false);
});

test('createReservationSchema validates variant and quantity', () => {
  const parsed = createReservationSchema.safeParse({
    productVariantId: '11111111-1111-4111-8111-111111111111',
    quantity: 2,
  });
  assert.equal(parsed.success, true);
});
