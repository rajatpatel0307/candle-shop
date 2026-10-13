import { useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supportApi } from '../support.api.js';
import { TicketConversation } from '../components/TicketConversation.jsx';
import { TicketMessageForm } from '../components/TicketMessageForm.jsx';
export function TicketDetails() { const { ticketId } = useParams(); const qc = useQueryClient(); const q = useQuery({ queryKey: ['ticket', ticketId], queryFn: async () => (await supportApi.detail(ticketId)).data.data.ticket }); const reply = useMutation({ mutationFn: (payload) => supportApi.reply(ticketId, payload), onSuccess: () => qc.invalidateQueries({ queryKey: ['ticket', ticketId] }) }); return <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6"><h1 className="text-4xl font-semibold">{q.data?.ticket?.TicketNumber || 'Ticket'}</h1><div className="mt-6 grid gap-5"><TicketConversation messages={q.data?.messages || []} /><TicketMessageForm pending={reply.isPending} onSubmit={(p) => reply.mutate(p)} /></div></main>; }
