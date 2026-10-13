import * as service from './checkout.service.js';
import {
  addressSelectionSchema,
  createSessionSchema,
  discountSchema,
  sessionIdSchema,
  shippingMethodSchema,
  submitCheckoutSchema,
} from './checkout.validation.js';
import { ok, validate } from '../carts/carts.utils.js';

export async function createSession(req, res) {
  ok(res.status(201), 'Checkout session created.', {
    checkout: await service.createSession(req.user.id, validate(createSessionSchema, req.body)),
  });
}

export async function getSession(req, res) {
  const { id } = validate(sessionIdSchema, req.params);
  ok(res, 'Checkout session loaded.', { checkout: await service.getSession(req.user.id, id) });
}

export async function updateAddresses(req, res) {
  const { id } = validate(sessionIdSchema, req.params);
  ok(res, 'Checkout addresses updated.', {
    checkout: await service.updateAddresses(req.user.id, id, validate(addressSelectionSchema, req.body)),
  });
}

export async function updateShippingMethod(req, res) {
  const { id } = validate(sessionIdSchema, req.params);
  ok(res, 'Checkout shipping method updated.', {
    checkout: await service.updateShippingMethod(req.user.id, id, validate(shippingMethodSchema, req.body)),
  });
}

export async function applyDiscount(req, res) {
  const { id } = validate(sessionIdSchema, req.params);
  ok(res, 'Discount applied.', { checkout: await service.applyDiscount(req.user.id, id, validate(discountSchema, req.body)) });
}

export async function removeDiscount(req, res) {
  const { id } = validate(sessionIdSchema, req.params);
  ok(res, 'Discount removed.', { checkout: await service.removeDiscount(req.user.id, id) });
}

export async function getSummary(req, res) {
  const { id } = validate(sessionIdSchema, req.params);
  ok(res, 'Checkout summary loaded.', { summary: await service.getSummary(req.user.id, id) });
}

export async function validateCheckout(req, res) {
  const { id } = validate(sessionIdSchema, req.params);
  ok(res, 'Checkout validation complete.', { validation: await service.validateSession(req.user.id, id) });
}

export async function submit(req, res) {
  const { id } = validate(sessionIdSchema, req.params);
  ok(res.status(201), 'Checkout submitted.', {
    result: await service.submit(req.user.id, id, validate(submitCheckoutSchema, req.body)),
  });
}
