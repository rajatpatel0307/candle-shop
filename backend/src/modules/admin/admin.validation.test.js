import test from 'node:test';
import assert from 'node:assert/strict';
import { dateRangeSchema, settingUpsertSchema } from './admin.validation.js';

test('dateRangeSchema accepts supported dashboard presets', () => {
  const parsed = dateRangeSchema.parse({ range: 'last7' });
  assert.equal(parsed.range, 'last7');
});

test('dateRangeSchema rejects incomplete custom ranges', () => {
  const result = dateRangeSchema.safeParse({ range: 'custom' });
  assert.equal(result.success, false);
});

test('settingUpsertSchema validates setting value type', () => {
  const parsed = settingUpsertSchema.parse({ settingValue: 'Candle Studio', valueType: 'string', isPublic: true });
  assert.equal(parsed.valueType, 'string');
});
