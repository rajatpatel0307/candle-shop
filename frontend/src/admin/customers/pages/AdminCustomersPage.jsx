import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Users } from 'lucide-react';
import { adminCustomersApi } from '../api/adminCustomersApi.js';
import { CustomersTable } from '../components/CustomersTable.jsx';

export function AdminCustomersPage() {
  const [search, setSearch] = useState('');
  const query = useQuery({
    queryKey: ['admin-customers', search],
    queryFn: async () => (await adminCustomersApi.list({ search })).data.data.customers,
  });

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold uppercase text-[#697565]"><Users className="h-4 w-4" /> Customers</p>
          <h1 className="mt-2 text-4xl font-semibold">Customer accounts</h1>
          <p className="mt-2 text-sm text-stone-600">Only customer-only accounts are shown here. Admin and support accounts are excluded.</p>
        </div>
        <label className="flex min-w-72 items-center gap-2 rounded-md border border-stone-300 bg-white px-3 py-2">
          <Search className="h-4 w-4 text-stone-500" />
          <input className="w-full bg-transparent text-sm outline-none" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search customers" />
        </label>
      </div>
      <div className="mt-6">
        {query.isLoading ? <div className="h-48 animate-pulse rounded-lg bg-stone-200" /> : <CustomersTable rows={query.data || []} />}
        {query.isError && <p className="mt-3 text-sm text-red-700">Could not load customers.</p>}
      </div>
    </main>
  );
}
