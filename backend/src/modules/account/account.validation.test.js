import test from 'node:test';
import assert from 'node:assert/strict';
import { profileSchema, addressSchema } from './account.validation.js';

test('profile edits normalize names and cannot change email or roles', () => {
  const parsed = profileSchema.parse({ firstName: ' Customer ', email: 'change@example.invalid', roles: ['ADMIN'] });
  assert.deepEqual(parsed, { firstName: 'Customer', lastName: '', phoneNumber: '' });
});

test('profile edits reject empty names and invalid phone numbers', () => {
  assert.equal(profileSchema.safeParse({ firstName: ' ' }).success, false);
  assert.equal(profileSchema.safeParse({ firstName: 'Customer', phoneNumber: '123' }).success, false);
});

test('saved address defaults require booleans and owner cannot be supplied', () => {
  const address = { recipientName: 'Customer', phoneNumber: '9876543210', addressLine1: '12 Test Road', city: 'Pune', stateOrProvince: 'Maharashtra', postalCode: '411001' };
  const parsed = addressSchema.parse({ ...address, userId: 'other-customer', isDefaultShipping: true });
  assert.equal(parsed.isDefaultShipping, true);
  assert.equal(parsed.isDefaultBilling, false);
  assert.equal('userId' in parsed, false);
  assert.equal(addressSchema.safeParse({ ...address, isDefaultShipping: 'false' }).success, false);
});
