import { AlertTriangle } from 'lucide-react';
import { formatNumber, productLabel, stockStatus } from '../utils/inventoryHelpers.js';

export function LowStockAlerts({ items = [] }) {
  return (
    <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-amber-700" />
        <h2 className="text-lg font-semibold">Stock alerts</h2>
      </div>
      <div className="grid gap-2">
        {items.slice(0, 8).map((item) => {
          const status = stockStatus(item);
          return (
            <div key={item.ProductVariantId} className="flex items-center justify-between gap-3 rounded-md border border-stone-200 px-3 py-2">
              <div>
                <p className="font-medium">{productLabel(item)}</p>
                <p className="text-xs text-stone-500">Available {formatNumber(item.AvailableQuantity)} / Reorder {formatNumber(item.ReorderLevel)}</p>
              </div>
              <span className={`rounded-full border px-2 py-1 text-xs font-semibold ${status.className}`}>{status.label}</span>
            </div>
          );
        })}
        {items.length === 0 && <p className="text-sm text-stone-500">No low-stock or out-of-stock alerts.</p>}
      </div>
    </section>
  );
}
