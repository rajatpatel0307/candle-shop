import { AppError } from '../../common/errors/AppError.js';
import { releaseReservation } from '../inventory/inventory.service.js';
import { CUSTOMER_CANCEL_STATUSES, ORDER_STATUS, PAYMENT_STATUS } from './orders.constants.js';
import * as repo from './orders.repository.js';
import { assertTransition } from './orders.status.service.js';

export async function listCustomer(userId, query) {
  const result = await repo.listCustomerOrders(userId, query);
  return { items: result.rows, pagination: { page: query.page, limit: query.limit, total: result.total } };
}

export async function listAdmin(query) {
  const result = await repo.listAdminOrders(query);
  return { items: result.rows, pagination: { page: query.page, limit: query.limit, total: result.total } };
}

export async function getCustomerOrder(userId, orderId) {
  const details = await repo.getOrderDetails(orderId, userId);
  if (!details) throw new AppError(404, 'ORDER_NOT_FOUND', 'Order was not found.');
  return details;
}

export async function getAdminOrder(orderId) {
  const details = await repo.getOrderDetails(orderId);
  if (!details) throw new AppError(404, 'ORDER_NOT_FOUND', 'Order was not found.');
  return details;
}

export async function getStatus(userId, orderId) {
  const details = await getCustomerOrder(userId, orderId);
  return { order: details.order, history: details.history, shipments: details.shipments, refunds: details.refunds };
}

export async function getTracking(userId, orderId) {
  const details = await getCustomerOrder(userId, orderId);
  return { order: details.order, shipments: details.shipments };
}

export async function updateStatus(actorUserId, orderId, input) {
  const order = await repo.getOrder(orderId);
  if (!order) throw new AppError(404, 'ORDER_NOT_FOUND', 'Order was not found.');
  assertTransition(order.OrderStatus, input.status);
  return repo.updateOrderStatus({ orderId, nextStatus: input.status, userId: actorUserId, reason: input.reason, source: 'ADMIN' });
}

export async function cancelCustomer(userId, orderId, input) {
  const details = await getCustomerOrder(userId, orderId);
  const order = details.order;
  if (!CUSTOMER_CANCEL_STATUSES.includes(order.OrderStatus)) {
    throw new AppError(409, 'ORDER_NOT_CANCELLABLE', 'This order can no longer be cancelled through the pre-shipment flow.');
  }
  if (order.PaymentStatus === PAYMENT_STATUS.SUCCEEDED && order.OrderStatus !== ORDER_STATUS.PENDING_PAYMENT) {
    await repo.createCancellationRequest({ orderId, userId, reason: input.reason });
    const updated = await repo.updateOrderStatus({ orderId, nextStatus: ORDER_STATUS.CANCELLATION_REQUESTED, userId, reason: input.reason, source: 'CUSTOMER' });
    return { order: updated, requiresReview: true };
  }
  const updated = await repo.updateOrderStatus({ orderId, nextStatus: ORDER_STATUS.CANCELLED, userId, reason: input.reason, source: 'CUSTOMER' });
  await releaseActiveReservations(details);
  return { order: updated, requiresReview: false };
}

export async function requestCancellation(userId, orderId, input) {
  await getCustomerOrder(userId, orderId);
  const request = await repo.createCancellationRequest({ orderId, userId, reason: input.reason });
  await repo.updateOrderStatus({ orderId, nextStatus: ORDER_STATUS.CANCELLATION_REQUESTED, userId, reason: input.reason, source: 'CUSTOMER' });
  return request;
}

export async function cancelAdmin(actorUserId, orderId, input) {
  const details = await getAdminOrder(orderId);
  if ([ORDER_STATUS.DELIVERED, ORDER_STATUS.RETURNED].includes(details.order.OrderStatus)) {
    throw new AppError(409, 'ORDER_NOT_CANCELLABLE', 'Delivered or returned orders require a return workflow.');
  }
  const updated = await repo.updateOrderStatus({ orderId, nextStatus: ORDER_STATUS.CANCELLED, userId: actorUserId, reason: input.reason, source: 'ADMIN' });
  await releaseActiveReservations(details);
  return updated;
}

export async function listCancellations(orderId) {
  return repo.listCancellations(orderId);
}

async function releaseActiveReservations(details) {
  for (const reservation of details.reservations || []) {
    if (reservation.ReservationStatus === 'ACTIVE') await releaseReservation(reservation.InventoryReservationId);
  }
}
