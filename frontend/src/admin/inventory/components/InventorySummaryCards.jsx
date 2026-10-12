import { AlertTriangle, Boxes, CheckCircle2, Package, ShieldCheck, Warehouse } from 'lucide-react';
import { formatNumber } from '../utils/inventoryHelpers.js';

const cards = [
  ['Total records', 'TotalRecords', Boxes],
  ['Physical stock', 'TotalOnHand', Warehouse],
  ['Reserved', 'TotalReserved', ShieldCheck],
  ['Available', 'TotalAvailable', CheckCircle2],
  ['Low stock', 'LowStockItems', AlertTriangle],
  ['Out of stock', 'OutOfStockItems', Package],
];

export function InventorySummaryCards({ summary = {} }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
      {cards.map(([label, key, Icon]) => (
        <section key={key} className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase text-stone-500">{label}</p>
            <Icon className="h-4 w-4 text-[#b56b45]" />
          </div>
          <p className="mt-3 text-2xl font-semibold">{formatNumber(summary[key])}</p>
        </section>
      ))}
    </div>
  );
}
