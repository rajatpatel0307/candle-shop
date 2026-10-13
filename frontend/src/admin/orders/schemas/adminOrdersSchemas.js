import { z } from 'zod';

export const shipmentSchema = z.object({
  carrierName: z.string().min(2),
  trackingNumber: z.string().optional(),
});
