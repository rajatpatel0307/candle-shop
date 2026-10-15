import { currency } from '../utils/checkoutHelpers.js';

export function PriceBreakdown({ pricing }) {
  const rows = [
    [`Price (${pricing?.items?.reduce((sum, item) => sum + Number(item.Quantity), 0) || 0} items)`, pricing?.subtotal],
    ['Discount', -(pricing?.discountAmount || 0)],
    ['Tax', pricing?.taxAmount],
    ['Shipping', pricing?.shippingAmount],
  ];
  return (
    <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
      <h2 className="border-b border-stone-100 pb-4 text-sm font-bold uppercase tracking-wide text-stone-500">Price details</h2>
      <div className="mt-4 space-y-2 text-sm">
        {rows.map(([label, value]) => <div key={label} className="flex justify-between gap-4 py-1"><span>{label}</span><span>{label === 'Shipping' && !pricing?.shipping?.eligible ? 'Calculated after address' : label === 'Shipping' && value === 0 ? 'FREE' : currency(value)}</span></div>)}
        <div className="flex justify-between border-t border-stone-200 pt-3 text-lg font-semibold">
          <span>Total</span><span>{currency(pricing?.totalAmount)}</span>
        </div>
      </div>
    </section>
  );
}
