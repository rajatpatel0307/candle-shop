import { z } from 'zod';

const guid = z.string().uuid();

export const notificationIdSchema = z.object({ notificationId: guid });
export const listNotificationsSchema = z.object({
  status: z.enum(['READ','UNREAD','']).optional(),
  search: z.string().trim().max(200).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
export const announcementSchema = z.object({
  userId: guid.optional(),
  title: z.string().trim().min(2).max(200),
  message: z.string().trim().min(2).max(1000),
  type: z.string().trim().min(2).max(50).default('ANNOUNCEMENT'),
});
