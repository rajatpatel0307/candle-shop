import { z } from 'zod';

const guid = z.string().uuid();

export const orderIdSchema = z.object({
  orderId: guid,
});

export const intentSchema = z.object({
  idempotencyKey: guid.optional(),
});

export const verifyPaymentSchema = z.object({
  providerOrderId: z.string().trim().min(1).max(200),
  providerPaymentId: z.string().trim().min(1).max(200),
  providerSignature: z.string().trim().min(1).max(500),
});

export const webhookProviderSchema = z.object({
  provider: z.string().trim().min(1).max(50).transform((value) => value.toUpperCase()),
});
