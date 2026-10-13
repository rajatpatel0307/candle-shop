import { useQuery } from '@tanstack/react-query';
import { adminFragrancesApi } from '../api/adminFragrancesApi.js';
import { FragranceTable } from '../components/FragranceTable.jsx';
export function AdminFragrancesPage() { const q = useQuery({ queryKey: ['admin-fragrances'], queryFn: async () => (await adminFragrancesApi.list()).data.data }); return <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6"><h1 className="text-4xl font-semibold">Fragrances</h1><div className="mt-6"><FragranceTable rows={q.data || []} /></div></main>; }
