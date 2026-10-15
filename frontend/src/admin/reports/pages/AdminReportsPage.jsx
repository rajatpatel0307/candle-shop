import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import { adminReportsApi } from '../api/adminReportsApi.js';
import { ReportExport } from '../components/ReportExport.jsx';
import { ReportTable } from '../components/ReportTable.jsx';
import { AdminPageHeader, AdminQueryState } from '../../shared/AdminUi.jsx';

export function AdminReportsPage() {
  const [type, setType] = useState('sales');
  const [range, setRange] = useState('last30');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const valid = range !== 'custom' || (from && to && from <= to);
  // End date is inclusive in the date picker; the API expects an exclusive upper bound.
  const params = range === 'custom' && valid ? { range, from, to: new Date(new Date(`${to}T00:00:00Z`).getTime() + 86400000).toISOString() } : { range };
  const q = useQuery({ queryKey: ['admin-report', type, params], enabled: Boolean(valid), queryFn: async () => (await adminReportsApi.report(type, params)).data.data.report.rows });
  const rows = q.data || [];
  return <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6"><AdminPageHeader title="Reports" description="Explore store performance and download the current report for your records." actions={<ReportExport type={type} params={params} disabled={!valid || q.isPending || q.isError || !rows.length} />} />
    <section className="admin-panel mb-5 flex flex-wrap items-end gap-4"><label className="min-w-40 flex-1 text-xs font-semibold text-stone-500">Report<select className="input mt-2 capitalize" value={type} onChange={(event) => setType(event.target.value)}>{['sales', 'revenue', 'orders', 'products', 'inventory', 'refunds'].map((option) => <option key={option} value={option}>{option === 'inventory' ? 'Low-stock inventory' : option}</option>)}</select></label><label className="min-w-40 flex-1 text-xs font-semibold text-stone-500">Time period<select className="input mt-2" value={range} onChange={(event) => setRange(event.target.value)}>{[['today','Today'],['last7','Last 7 days'],['last30','Last 30 days'],['currentMonth','This month'],['previousMonth','Last month'],['custom','Custom dates']].map(([key, name]) => <option key={key} value={key}>{name}</option>)}</select></label>{range === 'custom' && <><label className="text-xs font-semibold text-stone-500">From<input type="date" className="input mt-2" value={from} max={to || undefined} onChange={(event) => setFrom(event.target.value)} /></label><label className="text-xs font-semibold text-stone-500">To<input type="date" className="input mt-2" value={to} min={from || undefined} onChange={(event) => setTo(event.target.value)} /></label></>}<button className="icon-btn" aria-label="Refresh report" disabled={!valid || q.isFetching} onClick={() => q.refetch()}><RefreshCw className={`h-4 w-4 ${q.isFetching ? 'animate-spin' : ''}`} /></button></section>
    {type === 'inventory' && <p className="mb-4 text-sm text-stone-500">Current stock at or below its reorder level. Date filters apply to transaction reports.</p>}
    {!valid ? <p role="status" className="admin-panel text-sm text-amber-800">Choose a valid start and end date to load the report.</p> : <><div className="mb-3 flex items-center justify-between text-xs text-stone-500"><span>{q.isPending || q.isError ? 'Loading report' : `${rows.length} report rows`}</span><span>Amounts in INR</span></div><AdminQueryState query={q} empty={!rows.length} emptyText="No data for this report and time period." />{!q.isPending && !q.isError && rows.length > 0 && <ReportTable rows={rows} />}</>}
  </main>;
}
