import { currency } from '../utils/cartHelpers.js';

export function CartPriceBreakdown({ summary }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold">Price breakdown</h2>
      <div className="mt-3 flex justify-between text-sm">
        <span>Cart subtotal</span>
        <strong>{currency(summary?.subtotal || 0)}</strong>
      </div>
      <p className="mt-3 text-xs text-stone-500">Shipping, taxes, discounts, and payment fees are calculated during checkout.</p>
    </div>
  );
}
