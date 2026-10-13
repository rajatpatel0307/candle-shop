import test from 'node:test';
import assert from 'node:assert/strict';
import { createShipmentSchema, trackingEventSchema } from './shipping.validation.js';

test('createShipmentSchema accepts manual carrier details', () => {
  const parsed = createShipmentSchema.parse({ carrierName: 'Delhivery', trackingNumber: 'TRACK123' });
  assert.equal(parsed.carrierName, 'Delhivery');
  assert.equal(parsed.shippingCost, 0);
});

test('trackingEventSchema rejects unknown statuses', () => {
  const result = trackingEventSchema.safeParse({ trackingStatus: 'LOST' });
  assert.equal(result.success, false);
});
