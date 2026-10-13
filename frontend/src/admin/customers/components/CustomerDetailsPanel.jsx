function money(value) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(value || 0));
}

function dateTime(value) {
  if (!value) return 'Not available';
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

export function CustomerDetailsPanel({ data }) {
  const customer = data?.customer;
  if (!customer) return null;

  const fullName = [customer.FirstName, customer.LastName].filter(Boolean).join(' ') || 'Customer';
  const details = [
    ['Email', customer.Email],
    ['Phone', customer.PhoneNumber || 'Not added'],
    ['Status', customer.AccountStatus],
    ['Email verified', customer.EmailVerifiedAtUtc ? 'Yes' : 'No'],
    ['Joined', dateTime(customer.CreatedAtUtc)],
    ['Last login', dateTime(customer.LastLoginAtUtc)],
  ];

  return (
    <div className="mt-6 grid gap-5">
      <section className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase text-[#697565]">Customer profile</p>
            <h1 className="mt-2 text-4xl font-semibold">{fullName}</h1>
            <p className="mt-2 text-stone-600">{customer.Email}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(customer.roles || []).map((role) => <span key={role} className="rounded-full bg-[#efe6d8] px-3 py-1 text-sm font-semibold text-[#8d5132]">{role}</span>)}
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-stone-500">Total orders</p>
          <p className="mt-2 text-3xl font-semibold">{data.summary?.TotalOrders || 0}</p>
        </div>
        <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-stone-500">Lifetime value</p>
          <p className="mt-2 text-3xl font-semibold">{money(data.summary?.LifetimeValue)}</p>
        </div>
        <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-stone-500">Last order</p>
          <p className="mt-2 text-lg font-semibold">{dateTime(data.summary?.LastOrderAtUtc)}</p>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold">Account details</h2>
          <dl className="mt-5 grid gap-4">
            {details.map(([label, value]) => (
              <div key={label} className="grid gap-1 border-b border-stone-100 pb-3 last:border-0 last:pb-0 sm:grid-cols-[9rem_1fr]">
                <dt className="text-sm font-semibold text-stone-500">{label}</dt>
                <dd className="break-words text-sm">{value || 'Not available'}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold">Addresses</h2>
          <div className="mt-4 grid gap-3">
            {(data.addresses || []).map((address) => (
              <article key={address.AddressId} className="rounded-md border border-stone-200 p-4 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{address.RecipientName || address.AddressLabel || 'Address'}</p>
                  {address.IsDefaultShipping && <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">Shipping default</span>}
                  {address.IsDefaultBilling && <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800">Billing default</span>}
                </div>
                <p className="mt-2 leading-6 text-stone-600">
                  {[address.AddressLine1, address.AddressLine2, address.Locality, address.City, address.StateOrProvince, address.PostalCode, address.CountryCode].filter(Boolean).join(', ')}
                </p>
                {address.PhoneNumber && <p className="mt-1 text-stone-500">{address.PhoneNumber}</p>}
              </article>
            ))}
            {(!data.addresses || data.addresses.length === 0) && <p className="text-sm text-stone-600">No addresses saved.</p>}
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold">Recent orders</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-stone-100 text-xs uppercase text-stone-600">
              <tr><th className="px-4 py-3">Order</th><th>Status</th><th>Payment</th><th>Total</th><th>Created</th></tr>
            </thead>
            <tbody>
              {(data.orders || []).map((order) => (
                <tr key={order.OrderId} className="border-t border-stone-100">
                  <td className="px-4 py-3 font-semibold">{order.OrderNumber}</td>
                  <td className="px-4 py-3">{order.OrderStatus}</td>
                  <td className="px-4 py-3">{order.PaymentStatus}</td>
                  <td className="px-4 py-3">{money(order.GrandTotal)}</td>
                  <td className="px-4 py-3">{dateTime(order.CreatedAtUtc)}</td>
                </tr>
              ))}
              {(!data.orders || data.orders.length === 0) && <tr><td className="px-4 py-6 text-center text-stone-500" colSpan={5}>No orders found.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
