import { z } from 'zod';

export const receiptSchema = z.object({
  quantity: z.coerce.number().int().positive('Quantity must be greater than zero.'),
  referenceType: z.string().trim().max(50).optional(),
  notes: z.string().trim().max(500).optional(),
});

export const adjustmentSchema = z.object({
  type: z.enum(['IN', 'OUT']),
  quantity: z.coerce.number().int().positive('Quantity must be greater than zero.'),
  reason: z.string().trim().min(3, 'Reason is required.').max(500),
});

export const reorderSchema = z.object({
  reorderLevel: z.coerce.number().int().min(0),
  reorderQuantity: z.coerce.number().int().min(0),
});

export const reservationSchema = z.object({
  productVariantId: z.string().uuid('Valid product variant id is required.'),
  quantity: z.coerce.number().int().positive('Quantity must be greater than zero.'),
  expiresInMinutes: z.coerce.number().int().positive().max(240).optional(),
});
