import { ShoppingBag, Trash2 } from 'lucide-react';
import { CartItem } from './CartItem.jsx';

export function CartItemList({ items, actions, onClear, busy }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm" aria-label="Cart items">
      <div className="flex items-center justify-between gap-3 border-b border-stone-100 bg-stone-50/50 px-5 py-4 sm:px-6"><h2 className="flex items-center gap-2.5 text-sm font-semibold"><ShoppingBag className="h-4 w-4 text-[#a98463]" />Shopping bag<span className="rounded-full bg-[#f0e8dc] px-2 py-0.5 text-[10px] font-medium text-[#977351]">{items.length} {items.length === 1 ? 'product' : 'products'}</span></h2><button type="button" className="inline-flex items-center gap-1.5 text-xs text-stone-400 transition hover:text-red-700 disabled:opacity-50" disabled={busy} onClick={onClear}><Trash2 className="h-3.5 w-3.5" />{actions.clear.isPending ? 'Clearing...' : 'Clear cart'}</button></div>
      <div className="divide-y divide-stone-100 px-5 sm:px-6">{items.map((item) => <CartItem key={item.CartItemId} item={item} actions={actions} />)}</div>
    </section>
  );
}
