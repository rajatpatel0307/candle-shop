export function currency(value, currencyCode = 'INR') {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: currencyCode, maximumFractionDigits: 2 }).format(Number(value || 0));
}

export function newIdempotencyKey() {
  return crypto.randomUUID();
}

export function checkoutError(error, fallback = 'Something went wrong.') {
  if (error && !error.response && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
    return 'Unable to connect to checkout. Check your connection and try again.';
  }
  return error?.response?.data?.error?.message || error?.message || fallback;
}

export function selectedAddressLabel(address) {
  if (!address) return 'No address selected';
  return [address.RecipientName, address.AddressLine1, address.City, address.PostalCode].filter(Boolean).join(', ');
}
