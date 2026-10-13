import { currency } from '../utils/checkoutHelpers.js';

export function PriceBreakdown({ pricing }) {
  const rows = [
    ['Subtotal', pricing?.subtotal],
    ['Discount', -(pricing?.discountAmount || 0)],
    ['Tax', pricing?.taxAmount],
    ['Shipping', pricing?.shippingAmount],
  ];
  return (
    <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold">Price</h2>
      <div className="mt-4 space-y-2 text-sm">
        {rows.map(([label, value]) => <div key={label} className="flex justify-between"><span>{label}</span><span>{currency(value)}</span></div>)}
        <div className="flex justify-between border-t border-stone-200 pt-3 text-lg font-semibold">
          <span>Total</span><span>{currency(pricing?.totalAmount)}</span>
        </div>
      </div>
    </section>
  );
}
