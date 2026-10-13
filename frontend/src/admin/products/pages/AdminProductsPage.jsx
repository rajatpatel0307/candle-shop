import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminProductsApi } from '../api/adminProductsApi.js';
import { AdminProductTable } from '../components/AdminProductTable.jsx';
import { ProductFilters } from '../components/ProductFilters.jsx';
export function AdminProductsPage() { const [search, setSearch] = useState(''); const q = useQuery({ queryKey: ['admin-products', search], queryFn: async () => (await adminProductsApi.list({ search })).data.data }); return <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6"><h1 className="text-4xl font-semibold">Products</h1><div className="mt-6 grid gap-4"><ProductFilters search={search} onSearch={setSearch} />{q.data && <AdminProductTable products={q.data} />}</div></main>; }
