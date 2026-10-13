import * as service from './shipping.service.js';
import { createShipmentSchema, orderIdSchema, shipmentIdSchema, trackingEventSchema, updateShipmentSchema } from './shipping.validation.js';
import { ok, validate } from '../carts/carts.utils.js';

export async function createShipment(req, res) {
  const { orderId } = validate(orderIdSchema, req.params);
  ok(res.status(201), 'Shipment created.', { shipment: await service.createShipment(orderId, validate(createShipmentSchema, req.body), req.user.id) });
}

export async function listByOrder(req, res) {
  const { orderId } = validate(orderIdSchema, req.params);
  ok(res, 'Shipments loaded.', { shipments: await service.listByOrder(orderId) });
}

export async function getShipment(req, res) {
  const { shipmentId } = validate(shipmentIdSchema, req.params);
  ok(res, 'Shipment loaded.', { shipment: await service.getShipment(shipmentId) });
}

export async function updateShipment(req, res) {
  const { shipmentId } = validate(shipmentIdSchema, req.params);
  ok(res, 'Shipment updated.', { shipment: await service.updateShipment(shipmentId, validate(updateShipmentSchema, req.body)) });
}

export async function dispatchShipment(req, res) {
  const { shipmentId } = validate(shipmentIdSchema, req.params);
  ok(res, 'Shipment dispatched.', { shipment: await service.dispatchShipment(shipmentId, req.user.id) });
}

export async function tracking(req, res) {
  const { shipmentId } = validate(shipmentIdSchema, req.params);
  ok(res, 'Tracking loaded.', { tracking: await service.tracking(shipmentId) });
}

export async function addTrackingEvent(req, res) {
  const { shipmentId } = validate(shipmentIdSchema, req.params);
  ok(res.status(201), 'Tracking event recorded.', { tracking: await service.addTrackingEvent(shipmentId, validate(trackingEventSchema, req.body), req.user.id) });
}
