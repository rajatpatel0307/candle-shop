import { z } from 'zod';
import { MAX_CART_QUANTITY } from './carts.constants.js';

const guid = z.string().uuid();
const quantity = z.coerce.number().int().min(1).max(MAX_CART_QUANTITY);

export const addCartItemSchema = z.object({
  productId: guid.optional(),
  productVariantId: guid.optional(),
  quantity: quantity.default(1),
}).refine((value) => value.productId || value.productVariantId, {
  message: 'Product or product variant is required.',
  path: ['productVariantId'],
});

export const updateCartItemSchema = z.object({
  quantity,
});

export const cartItemIdSchema = z.object({
  itemId: z.coerce.number().int().positive(),
});
