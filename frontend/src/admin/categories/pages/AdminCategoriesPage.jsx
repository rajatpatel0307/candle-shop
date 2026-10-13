import { useQuery } from '@tanstack/react-query';
import { adminCategoriesApi } from '../api/adminCategoriesApi.js';
import { CategoryTable } from '../components/CategoryTable.jsx';
export function AdminCategoriesPage() { const q = useQuery({ queryKey: ['admin-categories'], queryFn: async () => (await adminCategoriesApi.list()).data.data }); return <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6"><h1 className="text-4xl font-semibold">Categories</h1><div className="mt-6"><CategoryTable rows={q.data || []} /></div></main>; }
