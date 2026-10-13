import { EmptyState } from '../../../shared/components/EmptyState.jsx';
import { TicketCard } from './TicketCard.jsx';
export function TicketList({ tickets = [] }) { if (!tickets.length) return <EmptyState title="No support tickets." />; return <div className="grid gap-3">{tickets.map((t) => <TicketCard key={t.SupportTicketId} ticket={t} />)}</div>; }
