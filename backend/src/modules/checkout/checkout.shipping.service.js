import { FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING_FEE } from './checkout.constants.js';

export function validateShippingAddress(address) {
  const missing = ['RecipientName', 'AddressLine1', 'City', 'PostalCode', 'CountryCode'].filter((field) => !address?.[field]);
  return { valid: missing.length === 0, missing };
}

export function calculateShipping({ subtotal, address }) {
  if (!address) return { amount: 0, methodCode: 'STANDARD', eligible: false, message: 'Shipping address is required.' };
  if (address.CountryCode && address.CountryCode !== 'IN') {
    return { amount: 0, methodCode: 'STANDARD', eligible: false, message: 'Shipping is currently available only within India.' };
  }
  return {
    amount: Number(subtotal) >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE,
    methodCode: 'STANDARD',
    eligible: true,
    message: null,
  };
}
