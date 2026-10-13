import { z } from 'zod';
import { ORDER_STATUS } from './orders.constants.js';

const guid = z.string().uuid();
const status = z.nativeEnum(ORDER_STATUS);

export const orderIdSchema = z.object({ orderId: guid });

export const listOrdersSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: status.optional(),
  paymentStatus: z.string().trim().max(30).optional(),
  search: z.string().trim().max(100).optional(),
  sortDir: z.enum(['asc', 'desc']).default('desc'),
});

export const statusUpdateSchema = z.object({
  status,
  reason: z.string().trim().min(3).max(500).optional(),
});

export const cancellationSchema = z.object({
  reason: z.string().trim().min(3).max(500),
  idempotencyKey: guid.optional(),
});

export const reviewCancellationSchema = z.object({
  approved: z.coerce.boolean(),
  notes: z.string().trim().max(500).optional(),
});
