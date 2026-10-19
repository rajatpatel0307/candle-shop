import { AdminListOverview, AdminSearchField, AdminTableHeading } from '../../shared/AdminListOverview.jsx';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { currency, formatDate } from '../../../features/orders/utils/ordersHelpers.js';
import { OrderStatusBadge } from '../../../features/orders/components/OrderStatusBadge.jsx';
import { useAdminRefunds } from '../hooks/useAdminOrders.js';
import { AdminQueryState, AdminPagination } from '../../shared/AdminUi.jsx';
export function AdminRefundsPage() {
  const query = useAdminRefunds();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page,setPage] = useState(1);
  const refunds = query.data || [];
  const rows = refunds.filter((refund) => (!status || refund.RefundStatus === status) && `${refund.RefundNumber} ${refund.OrderNumber} ${refund.Email}`.toLowerCase().includes(search.toLowerCase()));
  return <main className="mx-auto max-w-[1500px] px-4 py-10 sm:px-7"><AdminListOverview section="refunds" title="Refunds" pending={query.isFetching} onRefresh={()=>query.refetch()}/><section className="admin-panel mb-5 flex flex-wrap items-end gap-4"><AdminSearchField label="Search refunds" placeholder="Refund, order number or email" value={search} onChange={value=>{setSearch(value);setPage(1);}}/><label className="text-xs font-medium text-stone-500">Status<select className="input mt-2 sm:w-52" value={status} onChange={event=>{setStatus(event.target.value);setPage(1);}}><option value="">All statuses</option>{['PENDING','APPROVED','PROCESSING','SUCCEEDED','FAILED','CANCELLED'].map(value=><option key={value} value={value}>{value.replaceAll('_',' ')}</option>)}</select></label><button type="button" className="btn-secondary" disabled={!search&&!status} onClick={()=>{setSearch('');setStatus('');setPage(1);}}>Clear filters</button></section><AdminQueryState query={query} empty={!rows.length} emptyText="No refunds match your search." />{!query.isPending && !query.isError && rows.length > 0 && <section className="overflow-x-auto rounded-2xl border bg-white"><AdminTableHeading title="Refunds register" count={rows.slice((page-1)*20,page*20).length}/><table className="w-full min-w-[800px] text-left text-sm"><thead><tr>{['Refund / order','Customer','Amount','Status','Created',''].map((title) => <th key={title}>{title}</th>)}</tr></thead><tbody>{rows.slice((page-1)*20,page*20).map((refund) => <tr key={refund.RefundId} className="border-t"><td className="font-semibold">{refund.RefundNumber}<p className="mt-1 text-xs font-normal text-stone-500">{refund.OrderNumber}</p></td><td>{refund.Email}</td><td>{currency(refund.RefundAmount, refund.CurrencyCode)}</td><td><OrderStatusBadge status={refund.RefundStatus} /></td><td>{formatDate(refund.CreatedAtUtc)}</td><td><Link className="font-semibold text-[#8d5132]" to={`/admin/orders/${refund.OrderId}`}>Manage refund</Link></td></tr>)}</tbody></table></section>}{query.isSuccess && <AdminPagination page={page} limit={20} total={rows.length} pending={query.isFetching} onPage={setPage}/>}</main>;
}
