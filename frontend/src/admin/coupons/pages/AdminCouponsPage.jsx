import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminCouponsApi } from '../api/adminCouponsApi.js';
import { CouponForm } from '../components/CouponForm.jsx';
import { CouponTable } from '../components/CouponTable.jsx';
export function AdminCouponsPage() { const qc = useQueryClient(); const q = useQuery({ queryKey: ['admin-coupons'], queryFn: async () => (await adminCouponsApi.list()).data.data }); const create = useMutation({ mutationFn: adminCouponsApi.create, onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-coupons'] }) }); return <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6"><h1 className="text-4xl font-semibold">Coupons</h1><div className="mt-6 grid gap-5 lg:grid-cols-[1fr_340px]"><CouponTable rows={q.data || []} /><CouponForm pending={create.isPending} onSubmit={(payload) => create.mutate(payload)} /></div></main>; }
