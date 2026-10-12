import { Link } from 'react-router-dom';
import { ArrowRight, Flame } from 'lucide-react';
import { formatNumber, productLabel, stockStatus } from '../utils/inventoryHelpers.js';

export function InventoryTable({ items = [], loading = false }) {
  return (
    <div className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead className="bg-stone-100 text-xs uppercase text-stone-600">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Physical</th>
              <th className="px-4 py-3">Reserved</th>
              <th className="px-4 py-3">Available</th>
              <th className="px-4 py-3">Reorder</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const status = stockStatus(item);
              return (
                <tr key={item.ProductVariantId} className="border-t border-stone-100">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-stone-100">
                        {item.ImageUrl ? <img src={item.ImageUrl} alt={item.ProductName} className="h-full w-full object-cover" /> : <Flame className="h-5 w-5 text-[#b56b45]" />}
                      </div>
                      <div>
                        <p className="font-semibold">{item.ProductName}</p>
                        <p className="text-xs text-stone-500">{item.VariantName || item.CategoryName || 'Variant'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{item.SKU || 'No SKU'}</td>
                  <td className="px-4 py-3">{formatNumber(item.OnHandQuantity)}</td>
                  <td className="px-4 py-3">{formatNumber(item.ReservedQuantity)}</td>
                  <td className="px-4 py-3 font-semibold">{formatNumber(item.AvailableQuantity)}</td>
                  <td className="px-4 py-3">{formatNumber(item.ReorderLevel)}</td>
                  <td className="px-4 py-3"><span className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${status.className}`}>{status.label}</span></td>
                  <td className="px-4 py-3">
                    <Link className="inline-flex items-center gap-1 text-sm font-semibold text-[#8d5132]" to={`/admin/inventory/${item.ProductVariantId}`}>
                      Manage <ArrowRight className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              );
            })}
            {!loading && items.length === 0 && (
              <tr><td className="px-4 py-8 text-center text-stone-500" colSpan={8}>No inventory records found.</td></tr>
            )}
            {loading && (
              <tr><td className="px-4 py-8 text-center text-stone-500" colSpan={8}>Loading inventory...</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
