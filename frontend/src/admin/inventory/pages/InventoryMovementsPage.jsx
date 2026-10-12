import { InventoryMovementHistory } from '../components/InventoryMovementHistory.jsx';
import { InventoryPagination } from '../components/InventoryPagination.jsx';
import { useInventoryMovements } from '../hooks/useInventoryMovements.js';
import { useState } from 'react';

export function InventoryMovementsPage() {
  const [page, setPage] = useState(1);
  const query = useInventoryMovements({ page, limit: 25 });

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase text-[#697565]">Audit trail</p>
        <h1 className="text-4xl font-semibold">Inventory movements</h1>
      </div>
      {query.isError && <p className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{query.error?.response?.data?.error?.message || 'Could not load movements.'}</p>}
      <InventoryMovementHistory movements={query.data?.items || []} loading={query.isLoading} />
      <InventoryPagination pagination={query.data?.pagination} onPageChange={setPage} />
    </main>
  );
}
