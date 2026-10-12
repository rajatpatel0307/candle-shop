import { z } from 'zod';

const guid = z.string().uuid();

export const addWishlistItemSchema = z.object({
  productId: guid,
  productVariantId: guid.optional(),
});

export const wishlistIdSchema = z.object({
  id: guid,
});

export const wishlistItemIdSchema = z.object({
  itemId: guid,
});

export const productIdSchema = z.object({
  productId: guid,
});
