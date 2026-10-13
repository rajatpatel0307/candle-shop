import { Link } from 'react-router-dom';
import { TicketStatusBadge } from './TicketStatusBadge.jsx';
export function TicketCard({ ticket }) { return <article className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm"><div className="flex justify-between gap-3"><Link className="font-semibold text-[#8d5132]" to={`/support/tickets/${ticket.SupportTicketId}`}>{ticket.TicketNumber}</Link><TicketStatusBadge status={ticket.TicketStatus} /></div><p className="mt-2 text-sm">{ticket.Subject}</p><p className="text-xs text-stone-500">{ticket.Priority}</p></article>; }
