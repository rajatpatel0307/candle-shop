import { Link } from 'react-router-dom';
import { StatusBadge } from '../../../shared/components/StatusBadge.jsx';
export function TicketTable({ rows = [] }) { return <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">{rows.map((t) => <div key={t.SupportTicketId} className="flex justify-between border-b py-3 text-sm"><Link className="font-semibold text-[#8d5132]" to={`/admin/support/tickets/${t.SupportTicketId}`}>{t.TicketNumber}</Link><span>{t.Email}</span><StatusBadge status={t.TicketStatus} /></div>)}</section>; }
