import { Link } from 'react-router-dom';
import { Flame, Trash2 } from 'lucide-react';
import { CartQuantityControl } from './CartQuantityControl.jsx';
import { currency } from '../utils/cartHelpers.js';

export function CartItem({ item, actions }) {
  const unavailable = item.ProductStatus !== 'Active' || !item.IsActive || Number(item.AvailableQuantity) < Number(item.Quantity);

  return (
    <article className="grid gap-4 border-b border-stone-200 py-5 sm:grid-cols-[96px_1fr_auto]">
      <div className="flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-stone-100">
        {item.ImageUrl ? <img src={item.ImageUrl} alt={item.ProductName} className="h-full w-full object-cover" /> : <Flame className="h-8 w-8 text-[#b56b45]" />}
      </div>
      <div>
        <Link className="text-lg font-semibold" to={`/products/${item.Slug}`}>{item.ProductName}</Link>
        <p className="mt-1 text-sm text-stone-500">{item.VariantName || item.SKU}</p>
        <p className="mt-2 text-sm font-semibold">{currency(item.UnitPrice || item.SellingPrice)}</p>
        {unavailable && <p className="mt-2 text-sm text-red-700">Quantity or availability needs attention.</p>}
        <div className="mt-4 flex items-center gap-3">
          <CartQuantityControl
            value={Number(item.Quantity)}
            max={Math.max(Number(item.AvailableQuantity || 1), 1)}
            disabled={actions.update.isPending}
            onChange={(quantity) => actions.update.mutate({ itemId: item.CartItemId, quantity })}
          />
          <button className="icon-btn" disabled={actions.remove.isPending} onClick={() => actions.remove.mutate(item.CartItemId)} aria-label="Remove item">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="text-left sm:text-right">
        <p className="text-sm text-stone-500">Line total</p>
        <p className="text-xl font-semibold">{currency(item.LineTotal || Number(item.Quantity) * Number(item.SellingPrice))}</p>
      </div>
    </article>
  );
}
