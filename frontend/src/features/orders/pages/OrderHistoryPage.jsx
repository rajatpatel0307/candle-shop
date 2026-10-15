import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Search, RefreshCw, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { OrderList } from '../components/OrderList.jsx';
import { useOrders } from '../hooks/useOrders.js';
import { orderError } from '../utils/ordersHelpers.js';

const statuses = [['', 'All orders'], ['PENDING_PAYMENT', 'Awaiting payment'], ['CONFIRMED', 'Confirmed'], ['PROCESSING', 'Preparing'], ['READY_TO_SHIP', 'Ready to ship'], ['SHIPPED', 'Shipped'], ['DELIVERED', 'Delivered'], ['CANCELLED', 'Cancelled']];

export function OrderHistoryPage() {
  const [filters, setFilters] = useState({ page: 1, limit: 10 });
  const query = useOrders(filters);
  const pages = Math.max(1, Math.ceil((query.data?.pagination?.total || 0) / filters.limit));
  return <main className="space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="account-eyebrow">From our studio to your door</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">My orders</h1><p className="mt-2 text-sm text-stone-500">A little history of your favourite scents.</p></div><Link to="/shop" className="inline-flex items-center gap-2 text-xs font-semibold text-[#8d5132]">Explore the shop<ArrowRight className="h-4 w-4" /></Link></div>
    <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm" aria-label="Find your orders">
      <div className="flex items-center gap-3 p-4 sm:p-5"><div className="relative flex-1"><Search className="absolute left-3.5 top-4 h-4 w-4 text-stone-400" /><input className="account-input pl-10" aria-label="Search your orders" placeholder="Search by order number or candle..." value={filters.search || ''} onChange={(event) => setFilters({ ...filters, search: event.target.value, page: 1 })} /></div><button type="button" className="icon-btn shrink-0" aria-label="Refresh orders" disabled={query.isFetching} onClick={() => query.refetch()}><RefreshCw className={`h-4 w-4 ${query.isFetching ? 'animate-spin' : ''}`} /></button></div>
      <div className="flex gap-5 overflow-x-auto border-t border-stone-100 px-5" aria-label="Filter orders by status">{statuses.map(([status,label]) => <button key={status} type="button" aria-pressed={(filters.status || '') === status} onClick={() => setFilters({ ...filters, status: status || undefined, page: 1 })} className={`shrink-0 border-b-2 px-1 py-3.5 text-xs font-medium transition ${(filters.status || '') === status ? 'border-[#8d5132] text-[#8d5132]' : 'border-transparent text-stone-400 hover:text-stone-700'}`}>{label}</button>)}</div>
    </section>
    {query.isLoading && <div className="grid gap-4">{[1,2].map((item) => <div key={item} className="h-48 rounded-2xl border border-stone-200 bg-white motion-safe:animate-pulse" />)}</div>}
    {query.isError && <p role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{orderError(query.error)} <button className="underline" onClick={() => query.refetch()}>Try again</button></p>}
    {query.data && <><div className="flex items-center justify-between text-xs text-stone-400"><p>{query.data.pagination?.total || 0} {(query.data.pagination?.total || 0) === 1 ? 'order' : 'orders'} found</p><span>Most recent first</span></div><OrderList orders={query.data.items} /></>}
    {query.data && pages > 1 && <div className="flex items-center justify-between gap-3 border-t border-stone-200 pt-5 text-xs text-stone-500"><p>Page {filters.page} of {pages}</p><div className="flex gap-2"><button className="btn-secondary" disabled={query.isFetching || filters.page <= 1} onClick={() => setFilters({ ...filters, page: filters.page - 1 })}><ChevronLeft className="h-4 w-4" />Previous</button><button className="btn-secondary" disabled={query.isFetching || filters.page >= pages} onClick={() => setFilters({ ...filters, page: filters.page + 1 })}>Next<ChevronRight className="h-4 w-4" /></button></div></div>}
  </main>;
}
