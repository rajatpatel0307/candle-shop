import { DEFAULT_TAX_RATE } from './checkout.constants.js';
import { money } from '../carts/carts.utils.js';

export function calculateTax({ taxableAmount }) {
  return money(Number(taxableAmount || 0) * DEFAULT_TAX_RATE);
}
