import * as repo from './carts.repository.js';
import { money } from './carts.utils.js';

export async function validateCart(userId) {
  const cart = await repo.getOrCreateActiveCart(userId);
  const items = await repo.listCartItems(cart.CartId);
  const errors = [];
  const priceChanges = [];
  const unavailableItems = [];
  const quantityIssues = [];
  let subtotal = 0;

  const validatedItems = items.map((item) => {
    const unitPrice = money(item.SellingPrice);
    const lineTotal = money(unitPrice * Number(item.Quantity));
    const available = Number(item.AvailableQuantity || 0);
    const active = item.ProductStatus === 'Active' && item.IsActive;

    if (!active) {
      unavailableItems.push({ itemId: item.CartItemId, message: 'Product is not available.' });
      errors.push({ itemId: item.CartItemId, code: 'PRODUCT_UNAVAILABLE', message: 'Product is not available.' });
    }
    if (available < Number(item.Quantity)) {
      quantityIssues.push({ itemId: item.CartItemId, requested: item.Quantity, available });
      errors.push({ itemId: item.CartItemId, code: 'INSUFFICIENT_STOCK', message: 'Requested quantity exceeds available stock.' });
    }

    subtotal = money(subtotal + lineTotal);
    return { ...item, UnitPrice: unitPrice, LineTotal: lineTotal, AvailableQuantity: available };
  });

  return {
    isValid: errors.length === 0,
    cartId: cart.CartId,
    items: validatedItems,
    errors,
    priceChanges,
    unavailableItems,
    quantityIssues,
    subtotal,
  };
}
