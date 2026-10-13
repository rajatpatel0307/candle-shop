import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminContentApi } from '../api/adminContentApi.js';
import { SeoForm } from '../components/SeoForm.jsx';

export function ManageSeo() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ['admin-content-seo'], queryFn: async () => (await adminContentApi.seo.list()).data.data.seo.items });
  const create = useMutation({ mutationFn: adminContentApi.seo.create, onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-content-seo'] }) });
  const remove = useMutation({ mutationFn: adminContentApi.seo.remove, onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-content-seo'] }) });
  return <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6"><h1 className="text-4xl font-semibold">SEO metadata</h1><div className="mt-6"><SeoForm pending={create.isPending} onSubmit={(payload) => create.mutate(payload)} /></div><section className="mt-6 rounded-lg border border-stone-200 bg-white p-5 shadow-sm">{(q.data || []).map((s) => <div key={s.id} className="grid gap-3 border-b py-3 text-sm md:grid-cols-[1fr_auto]"><div><strong>{s.metaTitle}</strong><p className="text-stone-500">{s.path || `${s.entityType}:${s.entityId}`}</p></div><button className="text-red-700 underline" onClick={() => window.confirm('Delete this SEO record?') && remove.mutate(s.id)}>Delete</button></div>)}</section></main>;
}
