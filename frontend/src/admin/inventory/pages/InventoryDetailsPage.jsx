import { Link, useParams } from 'react-router-dom';
import { StockAdjustmentForm } from '../components/StockAdjustmentForm.jsx';
import { StockReceiptForm } from '../components/StockReceiptForm.jsx';
import { InventoryMovementHistory } from '../components/InventoryMovementHistory.jsx';
import { useInventoryItem, useInventoryMutations } from '../hooks/useInventory.js';
import { useInventoryMovements } from '../hooks/useInventoryMovements.js';
import { formatNumber, stockStatus } from '../utils/inventoryHelpers.js';

export function InventoryDetailsPage() {
  const { productVariantId } = useParams();
  const itemQuery = useInventoryItem(productVariantId);
  const movements = useInventoryMovements({ page: 1, limit: 20 }, productVariantId);
  const mutations = useInventoryMutations(productVariantId);
  const item = itemQuery.data;
  const status = stockStatus(item);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Link className="text-sm font-semibold text-[#8d5132]" to="/admin/inventory">Back to inventory</Link>
      {itemQuery.isLoading && <p className="mt-6 text-stone-500">Loading inventory record...</p>}
      {itemQuery.isError && <p className="mt-6 rounded-md bg-red-50 p-3 text-sm text-red-700">{itemQuery.error?.response?.data?.error?.message || 'Inventory record could not be loaded.'}</p>}
      {item && (
        <div className="mt-6 grid gap-5">
          <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase text-[#697565]">{item.SKU}</p>
                <h1 className="mt-1 text-3xl font-semibold">{item.ProductName}</h1>
                <p className="mt-1 text-stone-500">{item.VariantName || item.CategoryName}</p>
              </div>
              <span className={`rounded-full border px-3 py-1 text-sm font-semibold ${status.className}`}>{status.label}</span>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-4">
              <Metric label="Physical" value={item.OnHandQuantity} />
              <Metric label="Reserved" value={item.ReservedQuantity} />
              <Metric label="Available" value={item.AvailableQuantity} />
              <Metric label="Reorder level" value={item.ReorderLevel} />
            </div>
          </section>
          <div className="grid gap-5 lg:grid-cols-2">
            <StockReceiptForm item={item} mutation={mutations.receipt} />
            <StockAdjustmentForm item={item} mutation={mutations.adjustment} />
          </div>
          <InventoryMovementHistory movements={movements.data?.items || []} loading={movements.isLoading} />
        </div>
      )}
    </main>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-md border border-stone-200 p-3">
      <p className="text-xs font-semibold uppercase text-stone-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{formatNumber(value)}</p>
    </div>
  );
}
