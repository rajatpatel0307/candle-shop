import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

export function WishlistEmptyState() {
  return (
    <section className="rounded-lg border border-stone-200 bg-white p-10 text-center shadow-sm">
      <Heart className="mx-auto h-10 w-10 text-[#b56b45]" />
      <h2 className="mt-4 text-2xl font-semibold">Your wishlist is empty</h2>
      <p className="mt-2 text-stone-500">Save candles here and move them into your cart when you are ready.</p>
      <Link className="btn-primary mt-6" to="/shop">Explore candles</Link>
    </section>
  );
}
