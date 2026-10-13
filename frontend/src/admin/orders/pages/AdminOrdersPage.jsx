import { useState } from 'react';
import { AdminOrdersTable } from '../components/AdminOrdersTable.jsx';
import { OrderFilters } from '../components/OrderFilters.jsx';
import { OrderSearch } from '../components/OrderSearch.jsx';
import { useAdminOrders } from '../hooks/useAdminOrders.js';

export function AdminOrdersPage() {
  const [filters, setFilters] = useState({});
  const query = useAdminOrders(filters);
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-4xl font-semibold">Admin orders</h1>
      <div className="mt-6 grid gap-4">
        <OrderSearch value={filters.search} onChange={(search) => setFilters({ ...filters, search })} />
        <OrderFilters filters={filters} onChange={setFilters} />
        {query.isLoading && <p>Loading orders...</p>}
        {query.data && <AdminOrdersTable orders={query.data.items} />}
      </div>
    </main>
  );
}
