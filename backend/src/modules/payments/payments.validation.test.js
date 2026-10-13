import test from 'node:test';
import assert from 'node:assert/strict';
import { verifyPaymentSchema, webhookProviderSchema } from './payments.validation.js';

test('verifyPaymentSchema accepts provider payment references', () => {
  const parsed = verifyPaymentSchema.parse({
    providerOrderId: 'order_test',
    providerPaymentId: 'pay_test',
    providerSignature: 'signature',
  });
  assert.equal(parsed.providerOrderId, 'order_test');
});

test('webhookProviderSchema normalizes provider casing', () => {
  const parsed = webhookProviderSchema.parse({ provider: 'razorpay' });
  assert.equal(parsed.provider, 'RAZORPAY');
});
