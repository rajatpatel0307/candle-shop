import { AdminListOverview } from '../../shared/AdminListOverview.jsx';
import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, X } from 'lucide-react';
import { auditLogsApi } from '../api/auditLogsApi.js';
import { AuditLogsTable } from '../components/AuditLogsTable.jsx';
import { AdminPagination, AdminQueryState } from '../../shared/AdminUi.jsx';

export function AdminAuditLogsPage() {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ search: '', status: '', range: 'last30', page: 1 });
  const [selected, setSelected] = useState(null);
  const dialog = useRef(null);
  useEffect(() => { const timer = setTimeout(() => setFilters((value) => ({ ...value, search, page: 1 })), 300); return () => clearTimeout(timer); }, [search]);
  const q = useQuery({ queryKey: ['audit-logs', filters], queryFn: async () => (await auditLogsApi.list({ ...filters, limit: 25 })).data.data.auditLogs });
  const detail = useQuery({ queryKey: ['audit-log', selected], enabled: Boolean(selected), queryFn: async () => (await auditLogsApi.detail(selected)).data.data.auditLog });
  useEffect(() => { if (selected) dialog.current?.showModal(); }, [selected]);
  const change = (key, value) => setFilters((current) => ({ ...current, [key]: value, page: 1 }));
  const rows = q.data?.items || [];
  let details = detail.data?.DetailsJson;
  try { if (details) details = JSON.stringify(JSON.parse(details), null, 2); } catch { /* Display legacy plain-text details. */ }
  return <main className="mx-auto max-w-[1500px] px-4 py-10 sm:px-7">
    <AdminListOverview section="audit-logs" title="Audit logs" pending={q.isFetching} onRefresh={()=>q.refetch()}/>
    <section className="admin-panel mb-5 grid gap-4 items-end md:grid-cols-[minmax(0,1fr)_180px_180px_auto]">
      <label className="text-xs font-semibold text-stone-500">Search events<div className="relative mt-2"><Search className="absolute left-3 top-3 h-4 w-4" /><input className="input pl-10" type="search" placeholder="Action, entity, or actor email" value={search} onChange={(event) => setSearch(event.target.value)} /></div></label>
      <label className="text-xs font-semibold text-stone-500">Outcome<select className="input mt-2" value={filters.status} onChange={(event) => change('status', event.target.value)}><option value="">All outcomes</option><option value="SUCCESS">Success</option><option value="FAILURE">Failure</option><option value="DENIED">Denied</option></select></label>
      <label className="text-xs font-semibold text-stone-500">Time period<select className="input mt-2" value={filters.range} onChange={(event) => change('range', event.target.value)}><option value="today">Today</option><option value="last7">Last 7 days</option><option value="last30">Last 30 days</option><option value="currentMonth">This month</option><option value="previousMonth">Last month</option></select></label>
      <button type="button" className="btn-secondary" disabled={!search && !filters.status && filters.range==='last30'} onClick={()=>{setSearch('');setFilters({page:1,search:'',status:'',range:'last30'});}}>Clear filters</button>
    </section>
    <AdminQueryState query={q} empty={!rows.length} emptyText="No events match these filters. Try another search or time period." />
    {!q.isPending && !q.isError && rows.length > 0 && <><AuditLogsTable rows={rows} onSelect={setSelected} /><AdminPagination page={filters.page} limit={25} total={q.data.pagination.total} pending={q.isFetching} onPage={(page) => setFilters((current) => ({ ...current, page }))} /></>}
    <dialog ref={dialog} onClose={() => setSelected(null)} onClick={(event) => { if (event.target === dialog.current) dialog.current.close(); }} className="w-[calc(100%-2rem)] max-w-2xl rounded-2xl p-0 text-stone-800 shadow-2xl backdrop:bg-black/40">
      <div className="flex items-center justify-between border-b px-6 py-4"><h2 className="text-lg font-semibold">Event details</h2><button aria-label="Close event details" className="icon-btn" onClick={() => dialog.current.close()}><X className="h-4 w-4" /></button></div>
      <div className="max-h-[70vh] overflow-auto p-6"><AdminQueryState query={detail} />{detail.data && !detail.isError && <><dl className="grid gap-4 sm:grid-cols-2">{['ActionName', 'EntityName', 'Outcome', 'CreatedAtUtc', 'ActorUserId', 'EntityId', 'IpAddress', 'CorrelationId'].map((key) => <div key={key}><dt className="text-xs font-semibold uppercase tracking-wide text-stone-400">{key.replace(/([a-z])([A-Z])/g, '$1 $2')}</dt><dd className="mt-1 break-all text-sm">{detail.data[key] || 'Not recorded'}</dd></div>)}</dl><h3 className="mt-6 text-sm font-semibold">Additional details</h3><pre className="mt-2 whitespace-pre-wrap break-words rounded-xl bg-stone-50 p-4 text-xs leading-6">{details || 'No additional details.'}</pre></>}</div>
    </dialog>
  </main>;
}
