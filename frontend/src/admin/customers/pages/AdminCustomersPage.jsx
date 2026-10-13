import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminCustomersApi } from '../api/adminCustomersApi.js';
import { CustomersTable } from '../components/CustomersTable.jsx';
export function AdminCustomersPage() { const [search, setSearch] = useState(''); const q = useQuery({ queryKey: ['admin-customers', search], queryFn: async () => (await adminCustomersApi.list({ search })).data.data }); return <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6"><h1 className="text-4xl font-semibold">Customers</h1><input className="input mt-6" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customers" /> <div className="mt-4"><CustomersTable rows={q.data || []} /></div></main>; }
