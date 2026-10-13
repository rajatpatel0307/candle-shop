import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminContentApi } from '../api/adminContentApi.js';
import { ContentEditor } from '../components/ContentEditor.jsx';
import { ContentStatusBadge } from '../components/ContentStatusBadge.jsx';

export function ManageContentPages() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ['admin-content-pages'], queryFn: async () => (await adminContentApi.pages.list()).data.data.pages.items });
  const create = useMutation({ mutationFn: adminContentApi.pages.create, onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-content-pages'] }) });
  return <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6"><h1 className="text-4xl font-semibold">Content pages</h1><div className="mt-6"><ContentEditor pending={create.isPending} onSubmit={(payload) => create.mutate(payload)} /></div><section className="mt-6 rounded-lg border border-stone-200 bg-white p-5 shadow-sm">{(q.data || []).map((p) => <div key={p.id} className="grid gap-3 border-b py-3 text-sm md:grid-cols-[1fr_auto_auto]"><div><strong>{p.title}</strong><p className="text-stone-500">/{p.slug}</p></div><ContentStatusBadge status={p.status} /><Link className="text-[#8d5132] underline" to={`/admin/content/pages/${p.id}`}>Edit</Link></div>)}</section></main>;
}
