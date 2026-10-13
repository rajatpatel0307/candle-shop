import { z } from 'zod';

export const addCartItemSchema = z.object({
  productId: z.string().uuid().optional(),
  productVariantId: z.string().uuid().optional(),
  quantity: z.coerce.number().int().min(1).max(99),
}).refine((value) => value.productId || value.productVariantId, {
  message: 'Product selection is required.',
  path: ['productVariantId'],
});

export const updateCartItemSchema = z.object({
  quantity: z.coerce.number().int().min(1).max(99),
});
