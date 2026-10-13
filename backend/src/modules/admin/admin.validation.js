import { z } from 'zod';
import { DATE_RANGE_PRESETS, SETTING_TYPES } from './admin.constants.js';

const guid = z.string().uuid();

const dateRangeBaseSchema = z.object({
  range: z.enum(DATE_RANGE_PRESETS).default('last30'),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

function refineRange(value, ctx) {
  if (value.range === 'custom' && (!value.from || !value.to)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Custom range requires from and to dates.' });
  }
  if (value.from && value.to && value.from > value.to) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'from must be before to.' });
  }
}

export const dateRangeSchema = dateRangeBaseSchema.superRefine(refineRange);

export const listQuerySchema = dateRangeBaseSchema.extend({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(200).default(50),
  search: z.string().trim().max(150).optional(),
  status: z.string().trim().max(50).optional(),
}).superRefine(refineRange);

export const auditLogIdSchema = z.object({ id: guid });

export const settingKeySchema = z.object({ key: z.string().trim().min(1).max(150) });

export const settingUpsertSchema = z.object({
  settingKey: z.string().trim().min(1).max(150).optional(),
  settingValue: z.any().optional(),
  valueType: z.enum(SETTING_TYPES).default('string'),
  description: z.string().trim().max(500).optional(),
  isPublic: z.coerce.boolean().default(false),
});

export const settingsBulkSchema = z.object({
  settings: z.array(settingUpsertSchema.extend({ settingKey: z.string().trim().min(1).max(150) })).min(1).max(50),
});
