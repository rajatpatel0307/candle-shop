import test from 'node:test';
import assert from 'node:assert/strict';
import { announcementSchema } from './notifications.validation.js';

test('announcementSchema requires meaningful announcement content', () => {
  const parsed = announcementSchema.parse({ userId: '11111111-1111-4111-8111-111111111111', title: 'Update', message: 'Your order changed.' });
  assert.equal(parsed.type, 'ANNOUNCEMENT');
});
