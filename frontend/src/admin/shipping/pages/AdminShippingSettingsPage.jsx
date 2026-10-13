import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminShippingApi } from '../api/adminShippingApi.js';
import { ShippingRateForm } from '../components/ShippingRateForm.jsx';
import { ShippingRateTable } from '../components/ShippingRateTable.jsx';
export function AdminShippingSettingsPage() { const qc = useQueryClient(); const q = useQuery({ queryKey: ['shipping-rates'], queryFn: async () => (await adminShippingApi.rates()).data.data }); const create = useMutation({ mutationFn: adminShippingApi.createRate, onSuccess: () => qc.invalidateQueries({ queryKey: ['shipping-rates'] }) }); return <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6"><h1 className="text-4xl font-semibold">Shipping settings</h1><div className="mt-6 grid gap-5 lg:grid-cols-[1fr_320px]"><ShippingRateTable rows={q.data || []} /><ShippingRateForm pending={create.isPending} onSubmit={(payload) => create.mutate(payload)} /></div></main>; }
