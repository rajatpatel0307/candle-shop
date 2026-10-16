import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Archive, Check, CheckCircle2, ChevronDown, Clock3, Inbox, Mail, RefreshCw, Search, X } from 'lucide-react';
import { apiClient } from '../../../services/apiClient.js';
import { formatDate } from '../../../features/orders/utils/ordersHelpers.js';
import { AdminPagination, AdminQueryState } from '../../shared/AdminUi.jsx';

const statuses = { NEW: 'New', IN_PROGRESS: 'In progress', RESOLVED: 'Resolved', CLOSED: 'Closed' };
const statusColors = { NEW: 'bg-amber-50 text-amber-800 border-amber-200', IN_PROGRESS: 'bg-blue-50 text-blue-800 border-blue-200', RESOLVED: 'bg-emerald-50 text-emerald-800 border-emerald-200', CLOSED: 'bg-stone-100 text-stone-600 border-stone-200' };
const summaryCards = [
  { key: 'total', label: 'Total messages', icon: Inbox, color: 'bg-[#62684f] text-[#fff9ed]', highlight: true },
  { key: 'newMessages', label: 'New messages', icon: Mail, color: 'bg-amber-50 text-amber-800' },
  { key: 'inProgress', label: 'In progress', icon: Clock3, color: 'bg-blue-50 text-blue-800' },
  { key: 'resolved', label: 'Resolved messages', icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-800' },
  { key: 'closed', label: 'Closed messages', icon: Archive, color: 'bg-stone-100 text-stone-600' },
];

function MessageRow({ message, selected, onSelect, onSaved }) {
  const qc = useQueryClient();
  const update = useMutation({
    mutationFn: async (status) => (await apiClient.patch(`/admin/contact-messages/${message.ContactMessageId}`, { status })).data.data.message,
    onSuccess: async (saved) => {
      qc.setQueryData(['admin-contact-detail', message.ContactMessageId], saved);
      onSaved();
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['admin-contact'] }),
        qc.invalidateQueries({ queryKey: ['admin-contact-summary'] }),
      ]);
    },
  });
  const status = update.isPending ? update.variables : message.MessageStatus;
  return <tr className={`border-t align-top ${selected ? 'bg-[#f4ede0]' : ''}`}>
    <td><p className="font-medium">{message.Name}</p><a className="mt-1 inline-block break-all text-[11px] text-stone-500 hover:underline" href={`mailto:${message.Email}`}>{message.Email}</a></td>
    <td><button type="button" className="max-w-full text-left font-medium text-[#826345] hover:underline" onClick={onSelect}>{message.Subject}</button><p className="mt-1 line-clamp-2 max-w-sm break-words text-[11px] leading-5 text-stone-500">{message.Message}</p></td>
    <td className="whitespace-nowrap text-[11px] text-stone-500">{formatDate(message.CreatedAtUtc)}</td>
    <td><div className="relative w-36"><select aria-label={`Status for ${message.Subject}`} className={`w-full appearance-none rounded border py-2 pl-3 pr-7 text-[11px] font-medium ${statusColors[status] || statusColors.NEW}`} disabled={update.isPending} value={status} onChange={(event) => update.mutate(event.target.value)}>{Object.entries(statuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><ChevronDown className="pointer-events-none absolute right-2 top-2.5 h-3.5 w-3.5"/></div>
      <div className="mt-2 max-w-48 text-[10px]" aria-live="polite">{update.isPending ? <span className="text-stone-500">Saving status...</span> : update.isError ? <span role="alert" className="text-red-700">{update.error?.response?.data?.error?.message || 'Could not save. Choose a status to retry.'}</span> : update.isSuccess ? <span className="flex items-center gap-1 text-emerald-700"><Check size={12}/>Status saved</span> : null}</div>
    </td>
    <td><button type="button" className="whitespace-nowrap text-[11px] font-medium text-[#826345] hover:underline" aria-expanded={selected} aria-controls="contact-message-details" onClick={onSelect}>{selected ? 'Hide message' : 'Read message'}</button></td>
  </tr>;
}

export function ManageContactMessages() {
  const [filters, setFilters] = useState({ page: 1, status: '', search: '', sort: 'newest' });
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  useEffect(() => {
    const timer = setTimeout(() => setFilters(current => current.search === search.trim() ? current : { ...current, search: search.trim(), page: 1 }), 300);
    return () => clearTimeout(timer);
  }, [search]);
  const q = useQuery({ queryKey: ['admin-contact', filters], queryFn: async () => (await apiClient.get('/admin/contact-messages', { params: { ...filters, limit: 20 } })).data.data.messages });
  const summary = useQuery({ queryKey: ['admin-contact-summary'], queryFn: async () => (await apiClient.get('/admin/contact-messages/summary')).data.data.summary, refetchInterval: 30000 });
  const detail = useQuery({ queryKey: ['admin-contact-detail', selected], enabled: Boolean(selected), queryFn: async () => (await apiClient.get(`/admin/contact-messages/${selected}`)).data.data.message });
  const rows = q.data?.items || [];
  const change = (key, value) => setFilters(current => ({ ...current, [key]: value, page: 1 }));
  const filtered = Boolean(search || filters.status || filters.sort !== 'newest');
  return <main className="mx-auto max-w-[1500px] px-4 py-10 sm:px-7">
    <h1 className="sr-only">Contact messages</h1>
    <section className="mb-6" aria-label="Message summary" aria-busy={summary.isPending}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><div><h2 className="text-xl">Inbox overview</h2><p className="mt-1 text-[11px] text-stone-500">All messages, across every page and status</p></div><button type="button" className="btn-secondary" disabled={q.isFetching || summary.isFetching} onClick={() => { q.refetch(); summary.refetch(); }}><RefreshCw className={`h-3.5 w-3.5 ${q.isFetching || summary.isFetching ? 'animate-spin' : ''}`}/>Refresh</button></div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{summaryCards.map(({ key, label, icon: Icon, color, highlight }) => <article key={key} className={`min-w-0 rounded border p-5 ${highlight ? 'border-[#62684f] bg-[#62684f] text-[#fff9ed]' : 'border-[#e4dacd] bg-[#fffdf8]'}`}>
        <div className="flex items-center justify-between gap-2"><p className={`text-xs ${highlight ? 'text-[#eee4d0]' : 'text-stone-500'}`}>{label}</p><span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded ${color}`}><Icon className="h-4 w-4" strokeWidth={1.5}/></span></div>
        <p className="mt-5 font-serif text-4xl tabular-nums tracking-tight">{summary.isSuccess ? Number(summary.data[key]).toLocaleString('en-IN') : '--'}</p>
      </article>)}</div>
      {summary.isPending && <p role="status" className="mt-3 text-xs text-stone-500">Loading inbox totals...</p>}
      {summary.isError && <div role="alert" className="mt-3 flex flex-wrap items-center gap-3 text-xs text-red-700"><p>Inbox totals could not be loaded.</p><button type="button" className="underline" disabled={summary.isFetching} onClick={() => summary.refetch()}>Retry totals</button></div>}
    </section>
    <section className="admin-panel mb-5" aria-label="Message search and filters">
      <div className="grid items-end gap-4 md:grid-cols-[minmax(0,1fr)_180px_170px_auto]">
        <label className="block text-xs font-medium text-stone-500">Search messages<div className="relative mt-2"><Search className="pointer-events-none absolute left-3 top-3 h-4 w-4"/><input type="search" aria-label="Search messages" className="input w-full pl-10" placeholder="Name, email, subject or message" maxLength={200} value={search} onChange={(event) => setSearch(event.target.value)}/></div></label>
        <label className="block text-xs font-medium text-stone-500">Status<select className="input mt-2 w-full" value={filters.status} onChange={(event) => change('status', event.target.value)}><option value="">All statuses</option>{Object.entries(statuses).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label className="block text-xs font-medium text-stone-500">Received<select className="input mt-2 w-full" value={filters.sort} onChange={(event) => change('sort', event.target.value)}><option value="newest">Newest first</option><option value="oldest">Oldest first</option></select></label>
        <button type="button" className="btn-secondary" disabled={!filtered} onClick={() => { setSearch(''); setFilters({ page: 1, status: '', search: '', sort: 'newest' }); }}>Clear filters</button>
      </div>
    </section>
    <section className="overflow-hidden rounded border border-[#e4dacd] bg-[#fffdf8]" aria-label="Contact messages table">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e4dacd] px-5 py-4"><div className="flex items-center gap-2"><Mail className="h-4 w-4 text-[#89765e]"/><h2 className="text-lg">Customer inbox</h2></div><p className="text-[11px] text-stone-500" aria-live="polite">{q.isPending ? 'Loading messages...' : q.isError ? 'Messages unavailable' : `${q.data?.pagination.total || 0} matching messages`}</p></div>
      <AdminQueryState query={q} empty={!rows.length} emptyText={filtered ? 'No messages match your search and filters.' : 'Your inbox is empty. New customer enquiries will appear here.'}/>
      {!q.isPending && !q.isError && rows.length > 0 && <div className="overflow-x-auto"><table className="w-full min-w-[950px] text-left"><caption className="sr-only">Customer enquiries with editable status. Status changes save automatically.</caption><thead><tr>{['Customer','Subject / message','Received','Status','Action'].map(label => <th scope="col" key={label}>{label}</th>)}</tr></thead><tbody>{rows.map(message => <MessageRow key={message.ContactMessageId} message={message} selected={selected === message.ContactMessageId} onSelect={() => setSelected(current => current === message.ContactMessageId ? null : message.ContactMessageId)} onSaved={() => setFilters(current => current.page > 1 ? { ...current, page: 1 } : current)}/>)}</tbody></table></div>}
    </section>
    {!q.isPending && !q.isError && <AdminPagination page={filters.page} limit={20} total={q.data?.pagination.total || 0} pending={q.isFetching} onPage={page => setFilters(current => ({ ...current, page }))}/>}
    {selected && <section id="contact-message-details" className="admin-panel mt-6" aria-label="Message details"><div className="mb-5 flex items-center justify-between gap-4"><h2 className="text-2xl">Message details</h2><button type="button" className="icon-btn" aria-label="Close message details" onClick={() => setSelected(null)}><X size={16}/></button></div><AdminQueryState query={detail}/>{detail.isSuccess && detail.data && <><div className="flex flex-wrap items-start justify-between gap-4"><div><h3 className="break-words font-medium">{detail.data.Subject}</h3><p className="mt-2 text-xs text-stone-500">{detail.data.Name} / <a className="break-all hover:underline" href={`mailto:${detail.data.Email}`}>{detail.data.Email}</a></p><p className="mt-2 text-xs text-stone-500">{formatDate(detail.data.CreatedAtUtc)}</p></div><span className={`rounded border px-3 py-1 text-xs ${statusColors[detail.data.MessageStatus]}`}>{statuses[detail.data.MessageStatus]}</span></div><p className="mt-5 whitespace-pre-wrap break-words border-t border-[#e4dacd] pt-5 text-sm leading-7">{detail.data.Message}</p>{detail.data.AdminResponse && <div className="mt-5 rounded bg-[#f4ede0] p-4"><h4 className="text-xs font-medium">Recorded response</h4><p className="mt-2 whitespace-pre-wrap break-words text-sm leading-7">{detail.data.AdminResponse}</p></div>}</>}</section>}
  </main>;
}
