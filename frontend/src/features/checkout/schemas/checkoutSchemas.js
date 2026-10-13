import { z } from 'zod';

export const addressSelectionSchema = z.object({
  shippingAddressId: z.string().uuid(),
  billingAddressId: z.string().uuid().optional(),
  useShippingAsBilling: z.boolean(),
});

export const discountSchema = z.object({
  code: z.string().trim().min(1).max(50),
});
