import * as service from './orders.service.js';
import { cancellationSchema, listOrdersSchema, orderIdSchema, statusUpdateSchema } from './orders.validation.js';
import { ok, validate } from '../carts/carts.utils.js';

export async function listCustomer(req, res) {
  ok(res, 'Orders loaded.', { orders: await service.listCustomer(req.user.id, validate(listOrdersSchema, req.query)) });
}

export async function getCustomerOrder(req, res) {
  const { orderId } = validate(orderIdSchema, req.params);
  ok(res, 'Order loaded.', { order: await service.getCustomerOrder(req.user.id, orderId) });
}

export async function getStatus(req, res) {
  const { orderId } = validate(orderIdSchema, req.params);
  ok(res, 'Order status loaded.', { status: await service.getStatus(req.user.id, orderId) });
}

export async function getTracking(req, res) {
  const { orderId } = validate(orderIdSchema, req.params);
  ok(res, 'Order tracking loaded.', { tracking: await service.getTracking(req.user.id, orderId) });
}

export async function cancelCustomer(req, res) {
  const { orderId } = validate(orderIdSchema, req.params);
  ok(res, 'Order cancellation processed.', { cancellation: await service.cancelCustomer(req.user.id, orderId, validate(cancellationSchema, req.body)) });
}

export async function getCancellation(req, res) {
  const { orderId } = validate(orderIdSchema, req.params);
  await service.getCustomerOrder(req.user.id, orderId);
  ok(res, 'Cancellation requests loaded.', { cancellations: await service.listCancellations(orderId) });
}

export async function requestCancellation(req, res) {
  const { orderId } = validate(orderIdSchema, req.params);
  ok(res.status(201), 'Cancellation request created.', {
    cancellation: await service.requestCancellation(req.user.id, orderId, validate(cancellationSchema, req.body)),
  });
}

export async function listAdmin(req, res) {
  ok(res, 'Admin orders loaded.', { orders: await service.listAdmin(validate(listOrdersSchema, req.query)) });
}

export async function getAdminOrder(req, res) {
  const { orderId } = validate(orderIdSchema, req.params);
  ok(res, 'Admin order loaded.', { order: await service.getAdminOrder(orderId) });
}

export async function updateStatus(req, res) {
  const { orderId } = validate(orderIdSchema, req.params);
  ok(res, 'Order status updated.', { order: await service.updateStatus(req.user.id, orderId, validate(statusUpdateSchema, req.body)) });
}

export async function cancelAdmin(req, res) {
  const { orderId } = validate(orderIdSchema, req.params);
  ok(res, 'Order cancelled.', { order: await service.cancelAdmin(req.user.id, orderId, validate(cancellationSchema, req.body)) });
}

export async function getHistory(req, res) {
  const { orderId } = validate(orderIdSchema, req.params);
  ok(res, 'Order history loaded.', { history: (await service.getAdminOrder(orderId)).history });
}

export async function getCancellationsAdmin(req, res) {
  const { orderId } = validate(orderIdSchema, req.params);
  ok(res, 'Cancellation requests loaded.', { cancellations: await service.listCancellations(orderId) });
}
