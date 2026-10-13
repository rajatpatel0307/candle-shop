import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminContentApi } from '../api/adminContentApi.js';
import { PromotionForm } from '../components/PromotionForm.jsx';
import { ContentStatusBadge } from '../components/ContentStatusBadge.jsx';

export function ManagePromotions() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ['admin-content-promotions'], queryFn: async () => (await adminContentApi.promotions.list()).data.data.promotions.items });
  const create = useMutation({ mutationFn: adminContentApi.promotions.create, onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-content-promotions'] }) });
  const update = useMutation({ mutationFn: ({ id, payload }) => adminContentApi.promotions.update(id, payload), onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-content-promotions'] }) });
  const remove = useMutation({ mutationFn: adminContentApi.promotions.remove, onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-content-promotions'] }) });
  return <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6"><h1 className="text-4xl font-semibold">Promotional sections</h1><div className="mt-6"><PromotionForm pending={create.isPending} onSubmit={(payload) => create.mutate(payload)} /></div><section className="mt-6 rounded-lg border border-stone-200 bg-white p-5 shadow-sm">{(q.data || []).map((p) => <div key={p.id} className="grid gap-3 border-b py-3 text-sm md:grid-cols-[1fr_auto_auto]"><div><strong>{p.title}</strong><p className="text-stone-500">{p.layoutType}</p></div><ContentStatusBadge status={p.status} /><div className="flex gap-2"><button className="text-[#8d5132] underline" onClick={() => update.mutate({ id: p.id, payload: { status: p.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED' } })}>{p.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}</button><button className="text-red-700 underline" onClick={() => window.confirm('Archive this promotion?') && remove.mutate(p.id)}>Archive</button></div></div>)}</section></main>;
}
