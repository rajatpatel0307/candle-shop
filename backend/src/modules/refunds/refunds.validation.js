import { z } from 'zod';

const guid = z.string().uuid();

export const orderIdSchema = z.object({ orderId: guid });
export const refundIdSchema = z.object({ refundId: guid });

export const createRefundSchema = z.object({
  amount: z.coerce.number().positive().optional(),
  reason: z.string().trim().min(3).max(500),
  idempotencyKey: guid.optional(),
});

export const approveRefundSchema = z.object({
  notes: z.string().trim().max(500).optional(),
});
