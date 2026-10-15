import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../services/apiClient.js';
import { TicketTable } from '../components/TicketTable.jsx';
import { AdminPageHeader, AdminPagination, AdminQueryState } from '../../shared/AdminUi.jsx';
export function ManageTickets() {
  const [filters, setFilters] = useState({ page: 1, status: '' });
  const q = useQuery({ queryKey: ['admin-support', filters], queryFn: async () => (await apiClient.get('/admin/support/tickets', { params: { ...filters, limit: 20 } })).data.data.tickets });
  const rows = q.data?.items || [];
  return <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6"><AdminPageHeader title="Support tickets" description="Review customer issues, follow conversations, and manage assignments." /><section className="admin-panel mb-5"><label className="text-xs font-semibold text-stone-500">Ticket status<select className="input mt-2 max-w-xs" value={filters.status} onChange={(event) => setFilters({ page: 1, status: event.target.value })}><option value="">All tickets</option>{['OPEN','IN_PROGRESS','WAITING_FOR_CUSTOMER','RESOLVED','CLOSED'].map((status) => <option key={status}>{status}</option>)}</select></label></section><AdminQueryState query={q} empty={!rows.length} emptyText="No tickets match this status." />{!q.isPending && !q.isError && rows.length > 0 && <><TicketTable rows={rows} /><AdminPagination page={filters.page} limit={20} total={q.data.pagination.total} onPage={(page) => setFilters((current) => ({ ...current, page }))} /></>}</main>;
}
