import { AppError } from '../../common/errors/AppError.js';
import { MAX_CART_QUANTITY } from './carts.constants.js';
import * as repo from './carts.repository.js';
import { getSellableVariant } from './carts.pricing.service.js';
import { validateCart } from './carts.validation.service.js';
import { money } from './carts.utils.js';

function summarize(validation) {
  return {
    cartId: validation.cartId,
    items: validation.items,
    summary: {
      distinctItems: validation.items.length,
      totalQuantity: validation.items.reduce((sum, item) => sum + Number(item.Quantity), 0),
      subtotal: money(validation.subtotal),
      unavailableItemCount: validation.unavailableItems.length,
      isValid: validation.isValid,
    },
    validation,
  };
}

export async function getCart(userId) {
  return summarize(await validateCart(userId));
}

export async function getSummary(userId) {
  return summarize(await validateCart(userId)).summary;
}

export async function addItem(userId, input) {
  const cart = await repo.getOrCreateActiveCart(userId);
  const variant = await getSellableVariant(input);
  const existing = await repo.getExistingCartItem(cart.CartId, variant.ProductVariantId);
  const nextQuantity = Number(existing?.Quantity || 0) + Number(input.quantity);
  if (nextQuantity > MAX_CART_QUANTITY) throw new AppError(400, 'MAX_QUANTITY_EXCEEDED', `Maximum quantity is ${MAX_CART_QUANTITY}.`);
  if (Number(variant.AvailableQuantity || 0) < nextQuantity) {
    throw new AppError(409, 'INSUFFICIENT_STOCK', 'Requested quantity exceeds current availability.', {
      availableQuantity: Number(variant.AvailableQuantity || 0),
    });
  }
  await repo.upsertCartItem({ cartId: cart.CartId, productVariantId: variant.ProductVariantId, quantity: input.quantity });
  return getCart(userId);
}

export async function updateItem(userId, itemId, input) {
  const cart = await repo.getOrCreateActiveCart(userId);
  const items = await repo.listCartItems(cart.CartId);
  const item = items.find((row) => row.CartItemId === itemId);
  if (!item) throw new AppError(404, 'CART_ITEM_NOT_FOUND', 'Cart item was not found.');
  if (item.ProductStatus !== 'Active' || !item.IsActive) throw new AppError(409, 'PRODUCT_UNAVAILABLE', 'Product is unavailable.');
  if (Number(item.AvailableQuantity || 0) < Number(input.quantity)) {
    throw new AppError(409, 'INSUFFICIENT_STOCK', 'Requested quantity exceeds current availability.', {
      availableQuantity: Number(item.AvailableQuantity || 0),
    });
  }
  const updated = await repo.updateCartItemQuantity({ userId, itemId, quantity: input.quantity });
  if (!updated) throw new AppError(404, 'CART_ITEM_NOT_FOUND', 'Cart item was not found.');
  return getCart(userId);
}

export async function removeItem(userId, itemId) {
  const removed = await repo.removeCartItem({ userId, itemId });
  if (!removed) throw new AppError(404, 'CART_ITEM_NOT_FOUND', 'Cart item was not found.');
  return getCart(userId);
}

export async function clearCart(userId) {
  await repo.clearCart(userId);
  return getCart(userId);
}

export { validateCart };
