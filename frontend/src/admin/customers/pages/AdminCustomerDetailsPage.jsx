import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { adminCustomersApi } from '../api/adminCustomersApi.js';
import { CustomerDetailsPanel } from '../components/CustomerDetailsPanel.jsx';

export function AdminCustomerDetailsPage() {
  const { customerId } = useParams();
  const query = useQuery({
    queryKey: ['admin-customer', customerId],
    queryFn: async () => (await adminCustomersApi.detail(customerId)).data.data,
  });

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Link to="/admin/customers" className="inline-flex items-center gap-2 text-sm font-semibold text-[#8d5132]"><ArrowLeft className="h-4 w-4" /> Customers</Link>
      {query.isLoading && <div className="mt-6 h-72 animate-pulse rounded-lg bg-stone-200" />}
      {query.isError && <p className="mt-6 rounded-md bg-red-50 p-3 text-sm text-red-700">Customer was not found or is not a customer-only account.</p>}
      {query.data && <CustomerDetailsPanel data={query.data} />}
    </main>
  );
}
