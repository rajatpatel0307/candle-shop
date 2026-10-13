import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supportApi } from '../support.api.js';
import { TicketForm } from '../components/TicketForm.jsx';
import { TicketList } from '../components/TicketList.jsx';
export function MyTickets() { const qc = useQueryClient(); const q = useQuery({ queryKey: ['tickets'], queryFn: async () => (await supportApi.list()).data.data.tickets.items }); const create = useMutation({ mutationFn: supportApi.create, onSuccess: () => qc.invalidateQueries({ queryKey: ['tickets'] }) }); return <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6"><h1 className="text-4xl font-semibold">Support</h1><div className="mt-6 grid gap-5 lg:grid-cols-[1fr_340px]"><TicketList tickets={q.data || []} /><TicketForm pending={create.isPending} onSubmit={(p) => create.mutate(p)} /></div></main>; }
