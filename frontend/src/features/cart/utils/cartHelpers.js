export function currency(value) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(value || 0));
}

export function cartItems(cart) {
  return cart?.items || [];
}

export function cartSummary(cart) {
  return cart?.summary || { distinctItems: 0, totalQuantity: 0, subtotal: 0, isValid: true };
}
