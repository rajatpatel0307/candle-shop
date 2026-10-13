import * as service from './refunds.service.js';
import { approveRefundSchema, createRefundSchema, orderIdSchema, refundIdSchema } from './refunds.validation.js';
import { ok, validate } from '../carts/carts.utils.js';

export async function createRefund(req, res) {
  const { orderId } = validate(orderIdSchema, req.params);
  ok(res.status(201), 'Refund created.', { refund: await service.createRefund(orderId, validate(createRefundSchema, req.body), req.user.id) });
}

export async function listByOrder(req, res) {
  const { orderId } = validate(orderIdSchema, req.params);
  ok(res, 'Refunds loaded.', { refunds: await service.listByOrder(orderId) });
}

export async function getRefund(req, res) {
  const { refundId } = validate(refundIdSchema, req.params);
  ok(res, 'Refund loaded.', { refund: await service.getRefund(refundId) });
}

export async function approve(req, res) {
  const { refundId } = validate(refundIdSchema, req.params);
  validate(approveRefundSchema, req.body);
  ok(res, 'Refund approved.', { refund: await service.approve(refundId, req.user.id) });
}

export async function retry(req, res) {
  const { refundId } = validate(refundIdSchema, req.params);
  ok(res, 'Refund retry started.', { refund: await service.retry(refundId, req.user.id) });
}

export async function listAdmin(req, res) {
  ok(res, 'Admin refunds loaded.', { refunds: await service.listAdmin() });
}
