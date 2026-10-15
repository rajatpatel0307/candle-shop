import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Heart } from 'lucide-react';

export function CartEmptyState() {
  return <section className="rounded-2xl border border-stone-200 bg-white px-6 py-16 text-center shadow-sm sm:py-20">
    <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-[#eee0cf] bg-[#faf5ed]"><ShoppingBag className="h-10 w-10 text-[#b78a63]" strokeWidth={1.3} /><span className="absolute -right-1 top-1 h-4 w-4 rounded-full border-4 border-white bg-[#d3b593]" /></div>
    <p className="account-eyebrow mt-7">Room for something lovely</p><h2 className="mt-3 text-2xl font-semibold sm:text-3xl">Your cart is empty</h2><p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-stone-500">Find a scent for slow mornings, cosy evenings, or a little moment just for you.</p>
    <div className="mt-7 flex flex-wrap justify-center gap-3"><Link className="btn-primary rounded-xl" to="/shop">Explore the candles<ArrowRight className="h-4 w-4" /></Link><Link className="btn-secondary rounded-xl" to="/wishlist"><Heart className="h-4 w-4" />My wishlist</Link></div>
  </section>;
}
