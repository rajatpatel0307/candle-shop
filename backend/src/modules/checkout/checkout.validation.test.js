import test from 'node:test';
import assert from 'node:assert/strict';
import { addressSelectionSchema, createAddressSchema, submitCheckoutSchema } from './checkout.validation.js';

const address = {
  recipientName: ' Test Customer ', phoneNumber: '9876543210', addressLine1: '12 Garden Road',
  city: 'Mumbai', stateOrProvince: 'Maharashtra', postalCode: '400001',
};

test('checkout accepts a complete delivery address and normalizes its defaults', () => {
  const parsed = createAddressSchema.parse(address);
  assert.equal(parsed.recipientName, 'Test Customer');
  assert.equal(parsed.countryCode, 'IN');
  assert.equal(parsed.addressLabel, 'Home');
});

test('checkout rejects incomplete addresses and invalid contact details', () => {
  for (const invalid of [{ city: '' }, { postalCode: '000000' }, { phoneNumber: '123' }, { addressLine1: '12' }, { countryCode: 'US' }]) {
    assert.equal(createAddressSchema.safeParse({ ...address, ...invalid }).success, false);
  }
});

test('address input cannot supply an owner or default flags', () => {
  const parsed = createAddressSchema.parse({ ...address, userId: 'another-user', IsDefaultShipping: true });
  assert.equal('userId' in parsed, false);
  assert.equal('IsDefaultShipping' in parsed, false);
});

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

test('checkout accepts only supported payment methods', () => {
  const idempotencyKey = '11111111-1111-4111-8111-111111111111';
  assert.equal(submitCheckoutSchema.parse({ idempotencyKey, paymentMethod: 'COD' }).paymentMethod, 'COD');
  assert.equal(submitCheckoutSchema.safeParse({ idempotencyKey, paymentMethod: 'FREE' }).success, false);
});
