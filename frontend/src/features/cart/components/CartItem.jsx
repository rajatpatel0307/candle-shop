import { Link } from 'react-router-dom';
import { Flame, Trash2, LoaderCircle } from 'lucide-react';
import { CartQuantityControl } from './CartQuantityControl.jsx';
import { currency } from '../utils/cartHelpers.js';

export function CartItem({ item, actions }) {
  const available = Number(item.AvailableQuantity || 0);
  const quantity = Number(item.Quantity);
  const unavailable = item.ProductStatus !== 'Active' || !item.IsActive || available < quantity;
  const updating = actions.update.isPending && String(actions.update.variables?.itemId) === String(item.CartItemId);
  const removing = actions.remove.isPending && String(actions.remove.variables) === String(item.CartItemId);
  const busy = actions.update.isPending || actions.remove.isPending || actions.clear.isPending || actions.isValidating;
  return (
    <article className={`grid grid-cols-[76px_minmax(0,1fr)] items-start gap-x-4 gap-y-4 py-6 sm:grid-cols-[104px_minmax(0,1fr)_auto] sm:gap-x-5 ${removing ? 'opacity-50' : ''}`}>
      <Link to={`/products/${item.Slug}`} className="flex h-24 items-center justify-center overflow-hidden rounded-xl border border-[#eee5d9] bg-[#faf6ef] sm:h-28">
        {item.ImageUrl ? <img src={item.ImageUrl} alt={item.ProductName} className="h-full w-full object-cover" /> : <div className="text-center"><Flame className="mx-auto h-9 w-9 text-[#bb8e69]" strokeWidth={1.3} /><span className="mt-2 hidden text-[8px] uppercase tracking-[0.18em] text-[#bba48e] sm:block">Candle Studio</span></div>}
      </Link>
      <div className="min-w-0">
        <Link className="break-words text-base font-semibold transition hover:text-[#8d5132]" to={`/products/${item.Slug}`}>{item.ProductName}</Link>
        <p className="mt-1.5 text-xs text-stone-400">{item.VariantName || item.SKU}</p>
        <p className="mt-3 text-sm font-medium text-stone-600">{currency(item.UnitPrice ?? item.SellingPrice)}<span className="ml-1 text-[11px] font-normal text-stone-400">each</span></p>
        <p className={`mt-2 inline-flex items-center gap-1.5 text-[10px] font-medium ${unavailable ? 'text-red-700' : 'text-[#73805c]'}`}><span className="h-1 w-1 rounded-full bg-current" />{unavailable ? 'Quantity or availability needs attention' : 'In stock'}</p>
        <div className="mt-4 flex flex-wrap items-center gap-4"><CartQuantityControl value={quantity} max={Math.min(99, Math.max(available,1))} disabled={busy} onChange={(value) => actions.update.mutate({ itemId: item.CartItemId, quantity: value })} /><button type="button" disabled={busy} onClick={() => actions.remove.mutate(item.CartItemId)} aria-label={`Remove ${item.ProductName}`} className="flex items-center gap-1.5 text-xs text-stone-400 transition hover:text-red-700 disabled:opacity-40"><Trash2 className="h-3.5 w-3.5" />Remove</button>{updating && <LoaderCircle aria-label="Updating quantity" className="h-4 w-4 animate-spin text-[#a27655]" />}</div>
        {quantity >= Math.min(99,available) && <p className="mt-2 text-[11px] text-stone-400" role="status">{available <= 99 ? `Only ${available} available in stock.` : 'Maximum 99 per item.'}</p>}
        {actions.update.isError && String(actions.update.variables?.itemId) === String(item.CartItemId) && <p className="mt-2 text-xs text-red-700" role="alert">{actions.update.error?.response?.data?.error?.message || 'Could not update quantity. Please try again.'}</p>}
      </div>
      <div className="col-start-2 flex items-center justify-between gap-3 border-t border-stone-100 pt-3 sm:col-start-auto sm:block sm:border-0 sm:pt-0 sm:text-right"><p className="text-[10px] uppercase tracking-wider text-stone-400">Subtotal</p><p className="text-lg font-semibold sm:mt-2">{currency(item.LineTotal ?? quantity * Number(item.SellingPrice))}</p></div>
    </article>
  );
}
