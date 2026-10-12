import { useState } from 'react';
import { InventoryFilters } from '../components/InventoryFilters.jsx';
import { InventoryPagination } from '../components/InventoryPagination.jsx';
import { InventoryTable } from '../components/InventoryTable.jsx';
import { useInventory } from '../hooks/useInventory.js';

export function InventoryListPage() {
  const [filters, setFilters] = useState({ page: 1, limit: 20, status: 'all', sortBy: 'product', sortDir: 'asc' });
  const query = useInventory(filters);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase text-[#697565]">Inventory</p>
        <h1 className="text-4xl font-semibold">Stock records</h1>
      </div>
      <div className="grid gap-4">
        <InventoryFilters filters={filters} onChange={setFilters} />
        {query.isError && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{query.error?.response?.data?.error?.message || 'Could not load inventory.'}</p>}
        <InventoryTable items={query.data?.items || []} loading={query.isLoading} />
        <InventoryPagination pagination={query.data?.pagination} onPageChange={(page) => setFilters({ ...filters, page })} />
      </div>
    </main>
  );
}
