import { Link } from 'react-router-dom';
import { Package, ArrowUpRight, Truck, ChevronRight, Star } from 'lucide-react';
import { currency, formatDate } from '../utils/ordersHelpers.js';

const statusNames = { PENDING_PAYMENT: 'Awaiting payment', CONFIRMED: 'Confirmed', PROCESSING: 'Preparing your order', READY_TO_SHIP: 'Ready to ship', SHIPPED: 'On its way', DELIVERED: 'Delivered', CANCELLED: 'Cancelled', CANCELLATION_REQUESTED: 'Cancellation requested', RETURN_REQUESTED: 'Return requested', RETURNED: 'Returned' };

export function OrderCard({ order }) {
  const cancelled = order.OrderStatus === 'CANCELLED';
  const delivered = order.OrderStatus === 'DELIVERED';
  return (
    <article className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:border-stone-300">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 bg-stone-50/60 px-5 py-4 sm:px-6">
        <div><p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Order number</p><Link to={`/orders/${order.OrderId}`} className="mt-1 block text-sm font-semibold hover:text-[#8d5132]">{order.OrderNumber}</Link></div>
        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${cancelled ? 'bg-red-50 text-red-700' : delivered ? 'bg-green-50 text-green-700' : 'bg-[#f0e8da] text-[#8b623b]'}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{statusNames[order.OrderStatus] || order.OrderStatus}</span>
      </div>
      <div className="flex flex-wrap items-center gap-4 p-5 sm:p-6">
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-[#eee4d6] bg-[#faf6ef]"><Package className="h-7 w-7 text-[#b88b66]" strokeWidth={1.3} /></span>
        <div className="min-w-0 flex-1"><h2 className="text-sm font-semibold leading-6 sm:text-base">{order.FirstProductName || 'Your candle order'}</h2><p className="mt-1 text-xs text-stone-500">{order.ItemQuantity || 0} items</p><p className="mt-2 text-xs text-stone-400">Placed {formatDate(order.CreatedAtUtc)}</p></div>
        <div className="pl-20 text-left sm:pl-0 sm:text-right"><p className="text-lg font-semibold">{currency(order.GrandTotal, order.CurrencyCode)}</p><p className="mt-1 text-xs text-stone-500">{order.PaymentMethod === 'COD' && order.PaymentStatus !== 'SUCCEEDED' ? 'Pay on delivery' : order.PaymentStatus === 'SUCCEEDED' ? 'Payment received' : order.PaymentStatus?.toLowerCase().replaceAll('_', ' ')}</p></div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 px-5 py-3.5 sm:px-6">
        {delivered ? <Link className="inline-flex items-center gap-2 text-xs font-semibold text-[#8d5132]" to={`/orders/${order.OrderId}#reviews`}><Star className="h-4 w-4" />Rate & review products</Link> : !cancelled && <Link className="inline-flex items-center gap-2 text-xs font-medium text-stone-500 hover:text-[#8d5132]" to={`/orders/${order.OrderId}/tracking`}><Truck className="h-4 w-4" />Track delivery<ArrowUpRight className="h-3.5 w-3.5" /></Link>}
        <Link className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-[#8d5132]" to={`/orders/${order.OrderId}`}>View order details<ChevronRight className="h-4 w-4" /></Link>
      </div>
    </article>
  );
}
