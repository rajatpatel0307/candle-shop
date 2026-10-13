import { Link } from 'react-router-dom';
import { Flame, ShoppingBag, Trash2 } from 'lucide-react';
import { currency, isPurchasable } from '../utils/wishlistHelpers.js';

export function WishlistItem({ item, actions }) {
  const purchasable = isPurchasable(item);
  return (
    <article className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm">
      <div className="aspect-[4/3] bg-stone-100">
        {item.ImageUrl ? <img src={item.ImageUrl} alt={item.ProductName} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center"><Flame className="h-8 w-8 text-[#b56b45]" /></div>}
      </div>
      <div className="grid gap-3 p-4">
        <div>
          <Link className="text-lg font-semibold" to={`/products/${item.Slug}`}>{item.ProductName}</Link>
          <p className="mt-1 text-sm text-stone-500">{item.VariantName || item.SKU || 'Saved product'}</p>
        </div>
        <div className="flex items-center justify-between gap-3">
          <strong>{currency(item.SellingPrice)}</strong>
          <span className={purchasable ? 'text-sm text-green-700' : 'text-sm text-red-700'}>{purchasable ? 'Available' : 'Unavailable'}</span>
        </div>
        <div className="flex gap-2">
          <button className="btn-primary flex-1 px-3" disabled={!purchasable || actions.moveToCart.isPending} onClick={() => actions.moveToCart.mutate(item.WishlistItemId)}>
            <ShoppingBag className="h-4 w-4" /> Move
          </button>
          <button className="icon-btn" disabled={actions.remove.isPending} onClick={() => actions.remove.mutate(item.WishlistItemId)} aria-label="Remove from wishlist">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}
