import { z } from 'zod';
import { createAddressSchema } from '../checkout/checkout.validation.js';

export const profileSchema = z.object({
  firstName: z.string().trim().min(2).max(100),
  lastName: z.string().trim().max(100).default(''),
  phoneNumber: z.union([z.literal(''), z.string().trim().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number.')]).default(''),
});
export const addressSchema = createAddressSchema.extend({
  isDefaultShipping: z.boolean().default(false),
  isDefaultBilling: z.boolean().default(false),
});
export const addressIdSchema = z.object({ id: z.string().uuid() });
