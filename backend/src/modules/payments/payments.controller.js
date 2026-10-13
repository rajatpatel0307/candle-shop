import * as service from './payments.service.js';
import { intentSchema, orderIdSchema, verifyPaymentSchema } from './payments.validation.js';
import { ok, validate } from '../carts/carts.utils.js';

export async function createIntent(req, res) {
  const { orderId } = validate(orderIdSchema, req.params);
  ok(res.status(201), 'Payment intent created.', {
    payment: await service.createIntent(req.user.id, orderId, validate(intentSchema, req.body)),
  });
}

export async function getStatus(req, res) {
  const { orderId } = validate(orderIdSchema, req.params);
  ok(res, 'Payment status loaded.', { payment: await service.getStatus(req.user.id, orderId) });
}

export async function verify(req, res) {
  const { orderId } = validate(orderIdSchema, req.params);
  ok(res, 'Payment verified.', { payment: await service.verify(req.user.id, orderId, validate(verifyPaymentSchema, req.body)) });
}

export async function retry(req, res) {
  const { orderId } = validate(orderIdSchema, req.params);
  ok(res.status(201), 'Payment retry created.', {
    payment: await service.retry(req.user.id, orderId, validate(intentSchema, req.body)),
  });
}
