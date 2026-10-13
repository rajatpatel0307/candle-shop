import { useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminContentApi } from '../api/adminContentApi.js';
import { ContentEditor } from '../components/ContentEditor.jsx';

export function EditContentPage() {
  const { id } = useParams();
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ['admin-content-page', id], queryFn: async () => (await adminContentApi.pages.detail(id)).data.data.page });
  const update = useMutation({ mutationFn: (payload) => adminContentApi.pages.update(id, payload), onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-content-page', id] }) });
  const publish = useMutation({ mutationFn: () => adminContentApi.pages.publish(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-content-page', id] }) });
  const archive = useMutation({ mutationFn: () => adminContentApi.pages.archive(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-content-page', id] }) });
  return <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6"><div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-4xl font-semibold">Edit page</h1><div className="flex gap-2"><button className="btn-secondary" disabled={publish.isPending} onClick={() => publish.mutate()}>Publish</button><button className="btn-secondary" disabled={archive.isPending} onClick={() => window.confirm('Archive this page?') && archive.mutate()}>Archive</button></div></div><div className="mt-6">{q.data ? <ContentEditor initial={q.data} pending={update.isPending} onSubmit={(payload) => update.mutate(payload)} /> : <div className="h-72 animate-pulse rounded-lg bg-stone-200" />}</div></main>;
}
