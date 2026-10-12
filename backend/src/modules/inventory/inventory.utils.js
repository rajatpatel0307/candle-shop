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

export function created(res, message, data = undefined) {
  res.status(201).json({ success: true, message, ...(data ? { data } : {}) });
}

export function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

export function toOffset(page = 1, limit = 20) {
  return (Math.max(page, 1) - 1) * limit;
}
