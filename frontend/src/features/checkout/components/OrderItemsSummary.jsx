import { currency } from '../utils/checkoutHelpers.js';

export function OrderItemsSummary({ items = [] }) {
  return (
    <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold">Items</h2>
      <div className="mt-4 divide-y divide-stone-100">
        {items.map((item) => (
          <div key={item.CartItemId || item.ProductVariantId} className="flex justify-between gap-4 py-3 text-sm">
            <div>
              <p className="font-semibold">{item.ProductName}</p>
              <p className="text-stone-500">{item.VariantName || item.SKU} x {item.Quantity}</p>
            </div>
            <span>{currency(item.LineTotal)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
