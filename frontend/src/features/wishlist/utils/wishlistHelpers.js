export function currency(value) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(value || 0));
}

export function wishlistItems(wishlist) {
  return wishlist?.items || [];
}

export function isPurchasable(item) {
  return item?.ProductStatus === 'Active' && item?.IsActive && Number(item?.AvailableQuantity || 0) > 0;
}
