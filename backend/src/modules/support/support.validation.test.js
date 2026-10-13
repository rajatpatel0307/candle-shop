import test from 'node:test';
import assert from 'node:assert/strict';
import { ticketCreateSchema, ticketMessageSchema } from './support.validation.js';

test('ticketCreateSchema validates ticket creation', () => {
  const parsed = ticketCreateSchema.parse({ subject: 'Order issue', message: 'My candle arrived damaged.' });
  assert.equal(parsed.priority, 'NORMAL');
});

test('ticketMessageSchema supports staff internal notes', () => {
  const parsed = ticketMessageSchema.parse({ message: 'Check shipment photo.', isInternalNote: true });
  assert.equal(parsed.isInternalNote, true);
});
