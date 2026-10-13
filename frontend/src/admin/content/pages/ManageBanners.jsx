import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminContentApi } from '../api/adminContentApi.js';
import { BannerForm } from '../components/BannerForm.jsx';
import { ContentStatusBadge } from '../components/ContentStatusBadge.jsx';

export function ManageBanners() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ['admin-content-banners'], queryFn: async () => (await adminContentApi.banners.list()).data.data.banners.items });
  const create = useMutation({ mutationFn: adminContentApi.banners.create, onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-content-banners'] }) });
  const update = useMutation({ mutationFn: ({ id, payload }) => adminContentApi.banners.update(id, payload), onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-content-banners'] }) });
  const remove = useMutation({ mutationFn: adminContentApi.banners.remove, onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-content-banners'] }) });
  return <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6"><h1 className="text-4xl font-semibold">Homepage banners</h1><div className="mt-6"><BannerForm pending={create.isPending} onSubmit={(payload) => create.mutate(payload)} /></div><section className="mt-6 rounded-lg border border-stone-200 bg-white p-5 shadow-sm">{(q.data || []).map((b) => <div key={b.id} className="grid gap-3 border-b py-3 text-sm md:grid-cols-[1fr_auto_auto]"><div><strong>{b.title}</strong><p className="text-stone-500">{b.buttonUrl}</p></div><ContentStatusBadge status={b.status} /><div className="flex gap-2"><button className="text-[#8d5132] underline" onClick={() => update.mutate({ id: b.id, payload: { status: b.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED' } })}>{b.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}</button><button className="text-red-700 underline" onClick={() => window.confirm('Archive this banner?') && remove.mutate(b.id)}>Archive</button></div></div>)}</section></main>;
}
