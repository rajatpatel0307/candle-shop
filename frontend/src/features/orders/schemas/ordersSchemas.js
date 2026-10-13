import { z } from 'zod';

export const cancellationSchema = z.object({
  reason: z.string().trim().min(3).max(500),
});
