import { AppError } from '../../common/errors/AppError.js';

export function validate(schema, data) {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Validation failed.', parsed.error.flatten());
  }
  return parsed.data;
}

export function ok(res, message, data = undefined) {
  res.json({ success: true, message, ...(data ? { data } : {}) });
}

export function money(value) {
  return Number(Number(value || 0).toFixed(2));
}
