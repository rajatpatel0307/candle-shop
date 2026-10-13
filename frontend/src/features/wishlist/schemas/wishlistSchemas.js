import { z } from 'zod';

export const addWishlistItemSchema = z.object({
  productId: z.string().uuid(),
  productVariantId: z.string().uuid().optional(),
});
