import { AdminTableHeading } from '../../shared/AdminListOverview.jsx';
import { Link } from 'react-router-dom';
import { CustomerStatusControl } from './CustomerStatusControl.jsx';

function money(value) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(value || 0));
}

function date(value) {
  if (!value) return 'Not available';
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(new Date(value));
}

export function CustomersTable({ rows = [] }) {
  return (
    <section className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <AdminTableHeading title="Customer accounts" count={rows.length}/><table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-stone-100 text-xs uppercase text-stone-600">
            <tr>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Orders</th>
              <th className="px-4 py-3">Lifetime value</th>
              <th className="px-4 py-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.UserId} className="border-t border-stone-100">
                <td className="px-4 py-3">
                  <Link className="font-semibold text-[#8d5132]" to={`/admin/customers/${row.UserId}`}>{row.FirstName} {row.LastName}</Link>
                  <p className="mt-1 text-xs text-stone-500">{row.Email}</p>
                </td>
                <td className="px-4 py-3">{row.PhoneNumber || 'Not added'}</td>
                <td className="px-4 py-3"><CustomerStatusControl status={row.AccountStatus} /></td>
                <td className="px-4 py-3">{row.OrderCount || 0}</td>
                <td className="px-4 py-3 font-semibold">{money(row.LifetimeValue)}</td>
                <td className="px-4 py-3">{date(row.CreatedAtUtc)}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td className="px-4 py-8 text-center text-stone-500" colSpan={6}>No customer accounts found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
