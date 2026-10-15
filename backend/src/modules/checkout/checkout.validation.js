import { z } from 'zod';

const guid = z.string().uuid();

export const createAddressSchema = z.object({
  recipientName: z.string().trim().min(2).max(150),
  phoneNumber: z.string().trim().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number.'),
  addressLine1: z.string().trim().min(5).max(200),
  addressLine2: z.string().trim().max(200).optional(),
  locality: z.string().trim().max(120).optional(),
  city: z.string().trim().min(2).max(100),
  stateOrProvince: z.string().trim().min(2).max(100),
  postalCode: z.string().trim().regex(/^[1-9]\d{5}$/, 'Enter a valid 6-digit PIN code.'),
  countryCode: z.literal('IN').default('IN'),
  addressLabel: z.enum(['Home', 'Work']).default('Home'),
});

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
  shippingMethodId: z.coerce.number().int().positive().optional(),
  methodCode: z.string().trim().min(1).max(50).default('STANDARD'),
});

export const discountSchema = z.object({
  code: z.string().trim().min(1).max(50).transform((value) => value.toUpperCase()),
});

export const submitCheckoutSchema = z.object({
  idempotencyKey: guid,
  paymentMethod: z.enum(['COD', 'ONLINE']).default('ONLINE'),
  confirmPriceChanges: z.coerce.boolean().default(false),
});
