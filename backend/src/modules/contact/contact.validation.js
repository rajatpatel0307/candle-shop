import { z } from 'zod';

const guid = z.string().uuid();
export const messageIdSchema = z.object({ messageId: guid });
export const contactCreateSchema = z.object({
  name: z.string().trim().min(2).max(200),
  email: z.string().email().max(320),
  subject: z.string().trim().min(2).max(200),
  message: z.string().trim().min(10).max(4000),
});
export const contactUpdateSchema = z.object({
  status: z.enum(['NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
  assignedToUserId: guid.optional(),
  adminResponse: z.string().trim().max(4000).optional(),
});
export const listContactSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.string().trim().max(30).optional(),
  search: z.string().trim().max(200).optional(),
  sort: z.enum(['newest', 'oldest']).default('newest'),
});
