import { useState } from 'react';
import { AdminOrdersTable } from '../components/AdminOrdersTable.jsx';
import { OrderFilters } from '../components/OrderFilters.jsx';
import { OrderSearch } from '../components/OrderSearch.jsx';
import { useAdminOrders } from '../hooks/useAdminOrders.js';
import { RefreshCw } from 'lucide-react';

export function AdminOrdersPage() {
  const [filters, setFilters] = useState({ page: 1, limit: 20 });
  const query = useAdminOrders(filters);
  const updateFilters = (next) => setFilters({ ...next, page: 1 });
  const pagination = query.data?.pagination;
  const totalPages = Math.max(1, Math.ceil((pagination?.total || 0) / (pagination?.limit || filters.limit)));
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><h1 className="text-4xl font-semibold">Admin orders</h1><p className="mt-2 text-sm text-stone-500">{query.isSuccess ? `${pagination?.total || 0} orders` : 'Manage customer orders and payments.'}</p></div>
        <button type="button" className="btn-secondary" disabled={query.isFetching} onClick={() => query.refetch()}><RefreshCw className={`h-4 w-4 ${query.isFetching ? 'animate-spin' : ''}`} />{query.isFetching ? 'Refreshing...' : 'Refresh'}</button>
      </div>
      <div className="mt-6 grid gap-4">
        <OrderSearch value={filters.search} onChange={(search) => updateFilters({ ...filters, search })} />
        <OrderFilters filters={filters} onChange={updateFilters} />
        {query.isLoading && <p>Loading orders...</p>}
        {query.isError && <div role="alert" className="rounded-md bg-red-50 p-4 text-sm text-red-700">{query.error?.response?.data?.error?.message || 'Could not load orders. Please try again.'}<button type="button" className="ml-3 font-semibold underline" onClick={() => query.refetch()}>Try again</button></div>}
        {query.data && <AdminOrdersTable orders={query.data.items} />}
        {query.data && <div className="flex items-center justify-between gap-3 text-sm">
          <span>Page {pagination?.page || filters.page} of {totalPages}</span>
          <div className="flex gap-2">
            <button className="btn-secondary" disabled={query.isFetching || filters.page <= 1} onClick={() => setFilters({ ...filters, page: filters.page - 1 })}>Previous</button>
            <button className="btn-secondary" disabled={query.isFetching || filters.page >= totalPages} onClick={() => setFilters({ ...filters, page: filters.page + 1 })}>Next</button>
          </div>
        </div>}
      </div>
    </main>
  );
}
