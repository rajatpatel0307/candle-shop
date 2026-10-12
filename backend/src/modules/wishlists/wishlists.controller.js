import { AppError } from '../../common/errors/AppError.js';
import * as service from './wishlists.service.js';
import { addWishlistItemSchema, productIdSchema, wishlistIdSchema, wishlistItemIdSchema } from './wishlists.validation.js';

function validate(schema, data) {
  const parsed = schema.safeParse(data);
  if (!parsed.success) throw new AppError(400, 'VALIDATION_ERROR', 'Validation failed.', parsed.error.flatten());
  return parsed.data;
}

function ok(res, message, data = undefined) {
  res.json({ success: true, message, ...(data ? { data } : {}) });
}

export async function getWishlist(req, res) {
  ok(res, 'Wishlist loaded.', { wishlist: await service.getWishlist(req.user.id) });
}

export async function getWishlistItems(req, res) {
  const { id } = validate(wishlistIdSchema, req.params);
  ok(res, 'Wishlist items loaded.', await service.getWishlistItems(req.user.id, id));
}

export async function addItem(req, res) {
  ok(res.status(201), 'Wishlist item added.', { wishlist: await service.addItem(req.user.id, validate(addWishlistItemSchema, req.body)) });
}

export async function removeItem(req, res) {
  const { itemId } = validate(wishlistItemIdSchema, req.params);
  ok(res, 'Wishlist item removed.', { wishlist: await service.removeItem(req.user.id, itemId) });
}

export async function removeByProduct(req, res) {
  const { productId } = validate(productIdSchema, req.params);
  ok(res, 'Wishlist product removed.', { wishlist: await service.removeByProduct(req.user.id, productId) });
}

export async function moveToCart(req, res) {
  const { itemId } = validate(wishlistItemIdSchema, req.params);
  ok(res, 'Wishlist item moved to cart.', await service.moveToCart(req.user.id, itemId));
}
