import { currency } from '../utils/ordersHelpers.js';
import { Link } from 'react-router-dom';
import { OrderItemReview } from '../../reviews/components/OrderItemReview.jsx';

export function OrderItemsList({ items = [], order }) {
  return (
    <section id="reviews" className="scroll-mt-24 rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold">Items</h2>
      <div className="mt-4 divide-y divide-stone-100">
        {items.map((item) => (
          <div key={item.OrderItemId} className="py-4 text-sm">
            <div className="flex justify-between gap-4"><div>{item.ProductSlug ? <Link className="font-semibold hover:text-[#8d5132]" to={`/products/${item.ProductSlug}`}>{item.ProductNameSnapshot}</Link> : <p className="font-semibold">{item.ProductNameSnapshot}</p>}<p className="mt-1 text-xs text-stone-500">{item.VariantNameSnapshot || item.SKU} x {item.Quantity}</p></div><span className="font-semibold">{currency(item.LineTotal)}</span></div>
            {order && <OrderItemReview item={item} order={order} />}
          </div>
        ))}
      </div>
    </section>
  );
}
