import { z } from 'zod';
import { SHIPMENT_STATUS } from './shipping.constants.js';

const guid = z.string().uuid();

export const orderIdSchema = z.object({ orderId: guid });
export const shipmentIdSchema = z.object({ shipmentId: guid });

export const createShipmentSchema = z.object({
  carrierName: z.string().trim().min(2).max(100),
  carrierCode: z.string().trim().max(100).optional(),
  shippingService: z.string().trim().max(100).optional(),
  trackingNumber: z.string().trim().max(200).optional(),
  trackingUrl: z.string().trim().url().max(1000).optional(),
  shippingCost: z.coerce.number().min(0).default(0),
  estimatedDeliveryAtUtc: z.coerce.date().optional(),
});

export const updateShipmentSchema = createShipmentSchema.partial().extend({
  shipmentStatus: z.nativeEnum(SHIPMENT_STATUS).optional(),
});

export const trackingEventSchema = z.object({
  providerEventId: z.string().trim().max(200).optional(),
  trackingStatus: z.nativeEnum(SHIPMENT_STATUS),
  eventDescription: z.string().trim().max(500).optional(),
  eventLocation: z.string().trim().max(200).optional(),
  occurredAtUtc: z.coerce.date().default(() => new Date()),
});
