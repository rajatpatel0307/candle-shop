import { AdminQueryState } from '../../shared/AdminUi.jsx';
import { useState } from 'react';
import { currency } from '../../../features/orders/utils/ordersHelpers.js';
import { DashboardHeader } from '../components/DashboardHeader.jsx';
import { LowStockWidget } from '../components/LowStockWidget.jsx';
import { MetricCard } from '../components/MetricCard.jsx';
import { OrderStatusChart } from '../components/OrderStatusChart.jsx';
import { RecentActivityFeed } from '../components/RecentActivityFeed.jsx';
import { RecentOrdersTable } from '../components/RecentOrdersTable.jsx';
import { RevenueChart } from '../components/RevenueChart.jsx';
import { SalesOverviewChart } from '../components/SalesOverviewChart.jsx';
import { TopProductsTable } from '../components/TopProductsTable.jsx';
import { useDashboardMetrics } from '../hooks/useDashboardMetrics.js';

export function AdminDashboardPage() {
  const [range, setRange] = useState('last30');
  const data = useDashboardMetrics(range);
  const summary = data.summary.data || {};
  const failures = Object.entries(data).filter(([key,query]) => key !== 'summary' && query.isError);
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <DashboardHeader range={range} onRangeChange={setRange} />
      <AdminQueryState query={data.summary} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Gross sales" value={data.summary.isSuccess ? currency(summary.GrossSales) : '--'} sublabel={`Net ${currency(summary.NetSales)}`} />
        <MetricCard label="Orders" value={data.summary.isSuccess ? summary.TotalOrders : '--'} sublabel={`${summary.SuccessfulOrders || 0} paid`} />
        <MetricCard label="Refunds" value={data.summary.isSuccess ? currency(summary.RefundTotal) : '--'} />
        <MetricCard label="Average order" value={data.summary.isSuccess ? currency(summary.AverageOrderValue) : '--'} />
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-2">{failures.map(([key,query]) => <div key={key}><p className="mb-2 text-sm font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1')}</p><AdminQueryState query={query} /></div>)}
        <RevenueChart title="Revenue" data={data.revenue.data || []} />
        <SalesOverviewChart title="Orders" data={data.sales.data || []} />
        <OrderStatusChart data={data.orders.data || []} />
        <LowStockWidget items={data.lowStock.data || []} />
        <RecentOrdersTable orders={data.recentOrders.data || []} />
        <TopProductsTable products={data.topProducts.data || []} />
        <RecentActivityFeed activity={data.recentActivity.data || []} />
      </div>
    </main>
  );
}
