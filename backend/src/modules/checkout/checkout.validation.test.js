import test from 'node:test';
import assert from 'node:assert/strict';
import { addressSelectionSchema, submitCheckoutSchema } from './checkout.validation.js';

test('addressSelectionSchema accepts shipping-as-billing checkout input', () => {
  const shippingAddressId = '11111111-1111-4111-8111-111111111111';
  const parsed = addressSelectionSchema.parse({ shippingAddressId, useShippingAsBilling: true });
  assert.equal(parsed.shippingAddressId, shippingAddressId);
  assert.equal(parsed.useShippingAsBilling, true);
});

test('submitCheckoutSchema requires idempotency key', () => {
  const result = submitCheckoutSchema.safeParse({});
  assert.equal(result.success, false);
});
