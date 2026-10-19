import { z } from 'zod';

const guid = z.string().uuid();
export const ticketIdSchema = z.object({ ticketId: guid });
export const ticketCreateSchema = z.object({
  orderId: guid.optional(),
  subject: z.string().trim().min(3).max(200),
  category: z.string().trim().max(80).optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
  message: z.string().trim().min(10).max(4000),
});
export const ticketMessageSchema = z.object({
  message: z.string().trim().min(2).max(4000),
  isInternalNote: z.coerce.boolean().default(false),
});
export const ticketUpdateSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'WAITING_FOR_CUSTOMER', 'RESOLVED', 'CLOSED']).optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional(),
  assignedToUserId: guid.optional(),
});
export const listTicketsSchema = z.object({
  priority: z.enum(['LOW','NORMAL','HIGH','URGENT','']).optional(),
  search: z.string().trim().max(200).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.string().trim().max(30).optional(),
});
