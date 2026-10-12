import { formatDate, formatNumber } from '../utils/inventoryHelpers.js';

export function InventoryMovementHistory({ movements = [], loading = false }) {
  return (
    <section className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm">
      <div className="border-b border-stone-200 px-4 py-3">
        <h2 className="text-lg font-semibold">Movement history</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-stone-100 text-xs uppercase text-stone-600">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Change</th>
              <th className="px-4 py-3">Previous</th>
              <th className="px-4 py-3">New</th>
              <th className="px-4 py-3">Notes</th>
            </tr>
          </thead>
          <tbody>
            {movements.map((movement) => (
              <tr key={movement.InventoryMovementId} className="border-t border-stone-100">
                <td className="px-4 py-3">{formatDate(movement.CreatedAtUtc)}</td>
                <td className="px-4 py-3">{movement.ProductName || movement.ProductVariantId}</td>
                <td className="px-4 py-3">{movement.MovementType}</td>
                <td className="px-4 py-3 font-semibold">{formatNumber(movement.QuantityChange)}</td>
                <td className="px-4 py-3">{movement.PreviousOnHandQuantity ?? ''}</td>
                <td className="px-4 py-3">{movement.NewOnHandQuantity ?? ''}</td>
                <td className="max-w-64 truncate px-4 py-3">{movement.Notes || ''}</td>
              </tr>
            ))}
            {!loading && movements.length === 0 && <tr><td className="px-4 py-6 text-center text-stone-500" colSpan={7}>No movements found.</td></tr>}
            {loading && <tr><td className="px-4 py-6 text-center text-stone-500" colSpan={7}>Loading movements...</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}
