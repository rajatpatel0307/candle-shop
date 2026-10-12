import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { InventorySummaryCards } from '../components/InventorySummaryCards.jsx';
import { InventoryTable } from '../components/InventoryTable.jsx';
import { LowStockAlerts } from '../components/LowStockAlerts.jsx';
import { useInventory, useInventorySummary } from '../hooks/useInventory.js';

export function InventoryDashboard() {
  const summary = useInventorySummary();
  const alerts = useInventory({ status: 'low-stock', limit: 8 });

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase text-[#697565]">Stock control</p>
          <h1 className="text-4xl font-semibold">Inventory dashboard</h1>
        </div>
        <Link className="btn-primary" to="/admin/inventory">View inventory <ArrowRight className="h-4 w-4" /></Link>
      </div>
      <div className="grid gap-5">
        <InventorySummaryCards summary={summary.data || {}} />
        <LowStockAlerts items={alerts.data?.items || []} />
        <InventoryTable items={alerts.data?.items || []} loading={alerts.isLoading} />
      </div>
    </main>
  );
}
