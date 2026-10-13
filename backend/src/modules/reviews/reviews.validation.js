import { z } from 'zod';

const guid = z.string().uuid();

export const productIdSchema = z.object({ productId: guid });
export const reviewIdSchema = z.object({ reviewId: guid });

export const listReviewsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sort: z.enum(['newest', 'oldest', 'highest', 'lowest']).default('newest'),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'HIDDEN']).optional(),
});

export const reviewCreateSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().trim().max(200).optional(),
  comment: z.string().trim().min(10).max(2000),
  orderItemId: guid.optional(),
});

export const reviewUpdateSchema = reviewCreateSchema.partial().refine((value) => Object.keys(value).length > 0, 'At least one field is required.');

export const moderationSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED', 'HIDDEN', 'PENDING']),
  reason: z.string().trim().max(500).optional(),
});
