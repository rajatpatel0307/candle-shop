import { AdminQueryState } from '../../shared/AdminUi.jsx';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Banknote, ShoppingBag, RotateCcw, ChartNoAxesCombined } from 'lucide-react';
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
  const pending = Object.values(data).some(query => query.isFetching);
  const widget = (query, content) => query.isPending || query.isError ? <AdminQueryState query={query}/> : content;
  return (
    <main className="mx-auto max-w-[1500px] px-4 py-10 sm:px-7">
      <DashboardHeader range={range} onRangeChange={setRange} pending={pending} onRefresh={() => Object.values(data).forEach(query => query.refetch())}/>
      {data.summary.isError && <div className="mb-5"><AdminQueryState query={data.summary}/></div>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-busy={data.summary.isPending}>
        <MetricCard label="Gross sales" icon={Banknote} highlight value={data.summary.isSuccess ? currency(summary.GrossSales) : '--'} sublabel={data.summary.isSuccess ? `Net sales ${currency(summary.NetSales)}` : data.summary.isError ? 'Sales figures unavailable' : 'Loading sales figures'}/>
        <MetricCard label="Total orders" icon={ShoppingBag} value={data.summary.isSuccess ? summary.TotalOrders : '--'} sublabel={data.summary.isSuccess ? `${summary.SuccessfulOrders || 0} paid orders` : data.summary.isError ? 'Order figures unavailable' : 'Awaiting order figures'}/>
        <MetricCard label="Refunds" icon={RotateCcw} value={data.summary.isSuccess ? currency(summary.RefundTotal) : '--'} sublabel="In the selected period"/>
        <MetricCard label="Average order" icon={ChartNoAxesCombined} value={data.summary.isSuccess ? currency(summary.AverageOrderValue) : '--'} sublabel="In the selected period"/>
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        {widget(data.revenue,<RevenueChart title="Revenue over time" variant="line" data={data.revenue.data}/>)}
        {widget(data.sales,<SalesOverviewChart title="Orders over time" data={data.sales.data}/>)}
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        {widget(data.recentOrders,<RecentOrdersTable orders={data.recentOrders.data}/>)}
        {widget(data.lowStock,<LowStockWidget items={data.lowStock.data}/>)}
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        {widget(data.orders,<OrderStatusChart data={data.orders.data}/>)}
        {widget(data.topProducts,<TopProductsTable products={data.topProducts.data}/>)}
        {widget(data.recentActivity,<RecentActivityFeed activity={data.recentActivity.data}/>)}
      </div>
      <nav className="admin-shortcuts" aria-label="Store shortcuts">{[['/admin/products','Manage catalog'],['/admin/orders','Manage orders'],['/admin/customers','Your customers'],['/admin/reports','Explore reports']].map(([to,label])=><Link key={to} to={to}>{label}<ArrowUpRight size={14}/></Link>)}</nav>
    </main>
  );
}
