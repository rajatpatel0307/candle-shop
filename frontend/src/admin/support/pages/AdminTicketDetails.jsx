import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../services/apiClient.js';
import { TicketConversation } from '../../../features/support/components/TicketConversation.jsx';
import { TicketAssignment } from '../components/TicketAssignment.jsx';
import { AdminPageHeader, AdminQueryState, AdminMutationFeedback } from '../../shared/AdminUi.jsx';
export function AdminTicketDetails() {
  const {ticketId} = useParams();
  const qc = useQueryClient();
  const [message,setMessage] = useState('');
  const [internal,setInternal] = useState(false);
  const q = useQuery({queryKey:['admin-ticket',ticketId],queryFn:async () => (await apiClient.get(`/admin/support/tickets/${ticketId}`)).data.data.ticket});
  const invalidate = () => {qc.invalidateQueries({queryKey:['admin-ticket',ticketId]});qc.invalidateQueries({queryKey:['admin-support']});};
  const reply = useMutation({mutationFn:(payload) => apiClient.post(`/admin/support/tickets/${ticketId}/messages`,payload),onSuccess:() => {setMessage('');invalidate();}});
  const update = useMutation({mutationFn:(payload) => apiClient.patch(`/admin/support/tickets/${ticketId}`,payload),onSuccess:invalidate});
  const ticket = q.data?.ticket;
  const transitions = { OPEN:['IN_PROGRESS','CLOSED'],IN_PROGRESS:['WAITING_FOR_CUSTOMER','RESOLVED','CLOSED'],WAITING_FOR_CUSTOMER:['IN_PROGRESS','RESOLVED','CLOSED'],RESOLVED:['IN_PROGRESS','CLOSED'],CLOSED:[] };
  const statuses = ticket ? [ticket.TicketStatus,...(transitions[ticket.TicketStatus] || [])] : [];
  return <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6"><Link className="mb-5 inline-block text-sm font-semibold text-[#8d5132]" to="/admin/support-tickets">Back to tickets</Link><AdminPageHeader title={ticket?.TicketNumber || 'Support ticket'} description={ticket?.Subject} /><AdminQueryState query={q} /><AdminMutationFeedback mutations={[reply,update]} />{ticket && !q.isError && <div className="grid gap-5"><section className="admin-panel grid gap-4 sm:grid-cols-2"><label className="text-xs font-semibold text-stone-500">Status<select className="input mt-2" disabled={update.isPending} value={ticket.TicketStatus} onChange={(event) => update.mutate({status:event.target.value})}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></label><label className="text-xs font-semibold text-stone-500">Priority<select className="input mt-2" disabled={update.isPending} value={ticket.Priority} onChange={(event) => update.mutate({priority:event.target.value})}>{['LOW','NORMAL','HIGH','URGENT'].map((priority) => <option key={priority}>{priority}</option>)}</select></label></section><TicketAssignment assigneeId={ticket.AssignedToUserId || ''} pending={update.isPending} onAssign={(assignedToUserId) => update.mutate({assignedToUserId})} /><TicketConversation messages={q.data.messages || []} /><form className="admin-panel" onSubmit={(event) => {event.preventDefault();reply.mutate({message,isInternalNote:internal});}}><h2 className="text-lg font-semibold">{internal ? 'Internal note':'Reply to customer'}</h2><textarea aria-label="Ticket reply" required minLength={2} maxLength={4000} className="input mt-4 min-h-32" value={message} onChange={(event) => setMessage(event.target.value)} /><label className="mt-3 flex items-center gap-2 text-sm text-stone-500"><input type="checkbox" checked={internal} onChange={(event) => setInternal(event.target.checked)} />Internal note (visible to staff only)</label><button className="btn-primary mt-4" disabled={reply.isPending || message.trim().length < 2}>{reply.isPending ? 'Saving...':internal ? 'Save note':'Send reply'}</button></form></div>}</main>;
}
