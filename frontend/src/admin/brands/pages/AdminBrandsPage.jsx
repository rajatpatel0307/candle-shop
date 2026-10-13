import { useQuery } from '@tanstack/react-query';
import { adminBrandsApi } from '../api/adminBrandsApi.js';
import { BrandTable } from '../components/BrandTable.jsx';
export function AdminBrandsPage() { const q = useQuery({ queryKey: ['admin-brands'], queryFn: async () => (await adminBrandsApi.list()).data.data }); return <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6"><h1 className="text-4xl font-semibold">Brands</h1><div className="mt-6"><BrandTable rows={q.data || []} /></div></main>; }
