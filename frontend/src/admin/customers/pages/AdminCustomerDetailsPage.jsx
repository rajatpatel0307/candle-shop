import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { adminCustomersApi } from '../api/adminCustomersApi.js';
import { CustomerDetailsPanel } from '../components/CustomerDetailsPanel.jsx';
export function AdminCustomerDetailsPage() { const { customerId } = useParams(); const q = useQuery({ queryKey: ['admin-customer', customerId], queryFn: async () => (await adminCustomersApi.detail(customerId)).data.data }); return <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6"><h1 className="text-4xl font-semibold">Customer</h1><div className="mt-6"><CustomerDetailsPanel customer={q.data} /></div></main>; }
