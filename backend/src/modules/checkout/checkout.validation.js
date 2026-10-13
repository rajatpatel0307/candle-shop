import { z } from 'zod';

const guid = z.string().uuid();

export const sessionIdSchema = z.object({
  id: guid,
});

export const createSessionSchema = z.object({
  idempotencyKey: guid.optional(),
});

export const addressSelectionSchema = z.object({
  shippingAddressId: guid,
  billingAddressId: guid.optional(),
  useShippingAsBilling: z.coerce.boolean().default(true),
});

export const shippingMethodSchema = z.object({
  shippingMethodId: guid.optional(),
  methodCode: z.string().trim().min(1).max(50).default('STANDARD'),
});

export const discountSchema = z.object({
  code: z.string().trim().min(1).max(50).transform((value) => value.toUpperCase()),
});

export const submitCheckoutSchema = z.object({
  idempotencyKey: guid,
  confirmPriceChanges: z.coerce.boolean().default(false),
});
