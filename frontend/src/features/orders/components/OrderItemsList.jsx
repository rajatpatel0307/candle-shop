import { currency } from '../utils/ordersHelpers.js';

export function OrderItemsList({ items = [] }) {
  return (
    <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold">Items</h2>
      <div className="mt-4 divide-y divide-stone-100">
        {items.map((item) => (
          <div key={item.OrderItemId} className="flex justify-between gap-4 py-3 text-sm">
            <div><p className="font-semibold">{item.ProductNameSnapshot}</p><p className="text-stone-500">{item.VariantNameSnapshot || item.SKU} x {item.Quantity}</p></div>
            <span>{currency(item.LineTotal)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
