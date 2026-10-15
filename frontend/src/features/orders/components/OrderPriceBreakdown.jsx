import { currency } from '../utils/ordersHelpers.js';

export function OrderPriceBreakdown({ order }) {
  if (!order) return null;
  const rows = [['Subtotal', order.SubtotalAmount], ['Discount', -Number(order.DiscountAmount || 0)], ['Tax', order.TaxAmount], ['Shipping', order.ShippingAmount]];
  return (
    <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold">Total</h2>
      <div className="mt-4 space-y-2 text-sm">
        {rows.map(([label, value]) => <div key={label} className="flex justify-between"><span>{label}</span><span>{currency(value, order.CurrencyCode)}</span></div>)}
        <div className="flex justify-between border-t border-stone-200 pt-3 text-lg font-semibold"><span>Total</span><span>{currency(order.GrandTotal, order.CurrencyCode)}</span></div>
      </div>
    </section>
  );
}
