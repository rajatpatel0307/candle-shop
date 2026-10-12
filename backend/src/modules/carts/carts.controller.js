import * as service from './carts.service.js';
import { addCartItemSchema, cartItemIdSchema, updateCartItemSchema } from './carts.validation.js';
import { ok, validate } from './carts.utils.js';

export async function getCart(req, res) {
  ok(res, 'Cart loaded.', { cart: await service.getCart(req.user.id) });
}

export async function addItem(req, res) {
  ok(res.status(201), 'Cart item added.', { cart: await service.addItem(req.user.id, validate(addCartItemSchema, req.body)) });
}

export async function updateItem(req, res) {
  const { itemId } = validate(cartItemIdSchema, req.params);
  ok(res, 'Cart item updated.', { cart: await service.updateItem(req.user.id, itemId, validate(updateCartItemSchema, req.body)) });
}

export async function removeItem(req, res) {
  const { itemId } = validate(cartItemIdSchema, req.params);
  ok(res, 'Cart item removed.', { cart: await service.removeItem(req.user.id, itemId) });
}

export async function clearCart(req, res) {
  ok(res, 'Cart cleared.', { cart: await service.clearCart(req.user.id) });
}

export async function summary(req, res) {
  ok(res, 'Cart summary loaded.', { summary: await service.getSummary(req.user.id) });
}

export async function validateCurrentCart(req, res) {
  ok(res, 'Cart validation complete.', { validation: await service.validateCart(req.user.id) });
}

export async function availability(req, res) {
  ok(res, 'Cart availability loaded.', { validation: await service.validateCart(req.user.id) });
}
