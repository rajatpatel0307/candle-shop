import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';

export function CartEmptyState() {
  return (
    <section className="rounded-lg border border-stone-200 bg-white p-10 text-center shadow-sm">
      <ShoppingBag className="mx-auto h-10 w-10 text-[#b56b45]" />
      <h2 className="mt-4 text-2xl font-semibold">Your cart is empty</h2>
      <p className="mt-2 text-stone-500">Add candles you love, then come back here to review current price and availability.</p>
      <Link className="btn-primary mt-6" to="/shop">Continue shopping</Link>
    </section>
  );
}
