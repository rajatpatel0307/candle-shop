import { useState } from 'react';
import { Link } from 'react-router-dom';
import { currency, formatDate } from '../../../features/orders/utils/ordersHelpers.js';
import { OrderStatusBadge } from '../../../features/orders/components/OrderStatusBadge.jsx';
import { useAdminRefunds } from '../hooks/useAdminOrders.js';
import { AdminPageHeader, AdminQueryState } from '../../shared/AdminUi.jsx';
export function AdminRefundsPage() {
  const query = useAdminRefunds();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const refunds = query.data || [];
  const rows = refunds.filter((refund) => (!status || refund.RefundStatus === status) && `${refund.RefundNumber} ${refund.OrderNumber} ${refund.Email}`.toLowerCase().includes(search.toLowerCase()));
  return <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6"><AdminPageHeader title="Refunds" description="Track refund requests and their payment status. Open an order to review and approve a refund." /><section className="admin-panel mb-5 flex flex-wrap gap-3"><input aria-label="Search refunds" className="input min-w-48 flex-1" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Refund, order number, or email" /><select aria-label="Refund status" className="input sm:max-w-56" value={status} onChange={(event) => setStatus(event.target.value)}><option value="">All statuses</option>{[...new Set(refunds.map((refund) => refund.RefundStatus))].map((value) => <option key={value}>{value}</option>)}</select></section><AdminQueryState query={query} empty={!rows.length} emptyText="No refunds match your search." />{!query.isPending && !query.isError && rows.length > 0 && <section className="overflow-x-auto rounded-2xl border bg-white"><table className="w-full min-w-[800px] text-left text-sm"><thead><tr>{['Refund / order','Customer','Amount','Status','Created',''].map((title) => <th key={title}>{title}</th>)}</tr></thead><tbody>{rows.map((refund) => <tr key={refund.RefundId} className="border-t"><td className="font-semibold">{refund.RefundNumber}<p className="mt-1 text-xs font-normal text-stone-500">{refund.OrderNumber}</p></td><td>{refund.Email}</td><td>{currency(refund.RefundAmount, refund.CurrencyCode)}</td><td><OrderStatusBadge status={refund.RefundStatus} /></td><td>{formatDate(refund.CreatedAtUtc)}</td><td><Link className="font-semibold text-[#8d5132]" to={`/admin/orders/${refund.OrderId}`}>Manage refund</Link></td></tr>)}</tbody></table></section>}</main>;
}
