import { z } from 'zod';

const guid = z.string().uuid();
const positiveInt = z.coerce.number().int().positive();
const nonNegativeInt = z.coerce.number().int().min(0);

export const listInventorySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().trim().max(200).optional(),
  status: z.enum(['all', 'low-stock', 'out-of-stock', 'in-stock']).default('all'),
  categoryId: z.coerce.number().int().positive().optional(),
  sortBy: z.enum(['product', 'sku', 'onHand', 'reserved', 'available', 'reorderLevel']).default('product'),
  sortDir: z.enum(['asc', 'desc']).default('asc'),
});

export const variantIdSchema = z.object({
  productVariantId: guid,
});

export const reservationIdSchema = z.object({
  reservationId: guid,
});

export const receiptSchema = z.object({
  quantity: positiveInt,
  referenceType: z.string().trim().max(50).optional(),
  referenceId: guid.optional(),
  notes: z.string().trim().max(500).optional(),
  idempotencyKey: guid.optional(),
});

export const adjustmentSchema = z.object({
  type: z.enum(['IN', 'OUT']),
  quantity: positiveInt,
  reason: z.string().trim().min(3).max(500),
  referenceType: z.string().trim().max(50).optional(),
  referenceId: guid.optional(),
  idempotencyKey: guid.optional(),
});

export const reorderSchema = z.object({
  reorderLevel: nonNegativeInt,
  reorderQuantity: nonNegativeInt.optional(),
});

export const listMovementsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  movementType: z.string().trim().max(30).optional(),
});

export const createReservationSchema = z.object({
  productVariantId: guid,
  quantity: positiveInt,
  cartId: guid.optional(),
  orderId: guid.optional(),
  expiresInMinutes: z.coerce.number().int().positive().max(240).optional(),
  idempotencyKey: guid.optional(),
});

export const releaseReservationSchema = z.object({
  reason: z.string().trim().max(500).optional(),
});

export const confirmReservationSchema = z.object({
  orderId: guid.optional(),
});

export const expireReservationsSchema = z.object({
  limit: z.coerce.number().int().positive().max(500).default(100),
});
