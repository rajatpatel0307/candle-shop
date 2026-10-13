import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../services/apiClient.js';
import { TicketTable } from '../components/TicketTable.jsx';
export function ManageTickets() { const q = useQuery({ queryKey: ['admin-support'], queryFn: async () => (await apiClient.get('/admin/support/tickets')).data.data.tickets.items }); return <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6"><h1 className="text-4xl font-semibold">Support tickets</h1><div className="mt-6"><TicketTable rows={q.data || []} /></div></main>; }
