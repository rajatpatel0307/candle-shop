import { AppError } from '../../common/errors/AppError.js';
import * as ordersRepo from '../orders/orders.repository.js';
import { ORDER_STATUS } from '../orders/orders.constants.js';
import { assertTransition as assertOrderTransition } from '../orders/orders.status.service.js';
import { SHIPMENT_STATUS, SHIPMENT_TRANSITIONS } from './shipping.constants.js';
import { buildTrackingUrl } from './shipping.provider.service.js';
import * as repo from './shipping.repository.js';

function assertShipmentTransition(current, next) {
  if (current === next) return;
  if (!(SHIPMENT_TRANSITIONS[current] || []).includes(next)) {
    throw new AppError(409, 'INVALID_SHIPMENT_STATUS_TRANSITION', `Cannot move shipment from ${current} to ${next}.`);
  }
}

export async function createShipment(orderId, input, userId) {
  const order = await repo.getOrder(orderId);
  if (!order) throw new AppError(404, 'ORDER_NOT_FOUND', 'Order was not found.');
  if (!['CONFIRMED', 'PROCESSING', 'READY_TO_SHIP'].includes(order.OrderStatus)) {
    throw new AppError(409, 'ORDER_NOT_SHIPPABLE', 'Order is not eligible for shipment.');
  }
  const shipment = await repo.createShipment({
    orderId,
    input: { ...input, trackingUrl: buildTrackingUrl(input) },
  });
  if (order.OrderStatus !== ORDER_STATUS.READY_TO_SHIP) {
    assertOrderTransition(order.OrderStatus, ORDER_STATUS.READY_TO_SHIP);
    await ordersRepo.updateOrderStatus({ orderId, nextStatus: ORDER_STATUS.READY_TO_SHIP, userId, reason: 'Shipment created.', source: 'SHIPPING' });
  }
  return shipment;
}

export async function listByOrder(orderId) {
  return repo.listShipmentsByOrder(orderId);
}

export async function getShipment(shipmentId) {
  const shipment = await repo.getShipment(shipmentId);
  if (!shipment) throw new AppError(404, 'SHIPMENT_NOT_FOUND', 'Shipment was not found.');
  return { shipment, trackingEvents: await repo.listTrackingEvents(shipmentId) };
}

export async function updateShipment(shipmentId, input) {
  const current = await repo.getShipment(shipmentId);
  if (!current) throw new AppError(404, 'SHIPMENT_NOT_FOUND', 'Shipment was not found.');
  if (input.shipmentStatus) assertShipmentTransition(current.ShipmentStatus, input.shipmentStatus);
  return repo.updateShipment(shipmentId, { ...input, trackingUrl: buildTrackingUrl({ ...current, ...input }) });
}

export async function dispatchShipment(shipmentId, userId) {
  const current = await repo.getShipment(shipmentId);
  if (!current) throw new AppError(404, 'SHIPMENT_NOT_FOUND', 'Shipment was not found.');
  assertShipmentTransition(current.ShipmentStatus, SHIPMENT_STATUS.IN_TRANSIT);
  const shipment = await repo.updateShipment(shipmentId, { shipmentStatus: SHIPMENT_STATUS.IN_TRANSIT });
  await repo.addTrackingEvent({ shipmentId, userId, input: { trackingStatus: SHIPMENT_STATUS.IN_TRANSIT, eventDescription: 'Shipment dispatched.', occurredAtUtc: new Date() } });
  await ordersRepo.updateOrderStatus({ orderId: current.OrderId, nextStatus: ORDER_STATUS.SHIPPED, userId, reason: 'Shipment dispatched.', source: 'SHIPPING' });
  return shipment;
}

export async function addTrackingEvent(shipmentId, input, userId) {
  const shipment = await repo.getShipment(shipmentId);
  if (!shipment) throw new AppError(404, 'SHIPMENT_NOT_FOUND', 'Shipment was not found.');
  assertShipmentTransition(shipment.ShipmentStatus, input.trackingStatus);
  const result = await repo.addTrackingEvent({ shipmentId, input, userId });
  if (input.trackingStatus === SHIPMENT_STATUS.DELIVERED) {
    await ordersRepo.updateOrderStatus({ orderId: shipment.OrderId, nextStatus: ORDER_STATUS.DELIVERED, userId, reason: 'Shipment delivered.', source: 'SHIPPING' });
  }
  return result;
}

export async function tracking(shipmentId) {
  await getShipment(shipmentId);
  return repo.listTrackingEvents(shipmentId);
}
