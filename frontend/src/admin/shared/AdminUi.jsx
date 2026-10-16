import { AlertCircle, Inbox, RefreshCw } from 'lucide-react';

export function AdminPageHeader({ title, description, actions }) {
  return <div className="admin-page-heading mb-8 flex flex-wrap items-end justify-between gap-5"><div><p className="account-eyebrow mb-2">Store management</p><h1 className="text-3xl font-semibold tracking-tight">{title}</h1>{description && <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500">{description}</p>}</div>{actions}</div>;
}

export function AdminQueryState({ query, empty = false, emptyText = 'No records found.' }) {
  if (query.isPending) return <div role="status" className="admin-panel flex items-center gap-3 py-10 text-sm text-stone-500"><RefreshCw className="h-4 w-4 animate-spin" />Loading records...</div>;
  if (query.isError) return <div role="alert" className="admin-panel border-red-200 bg-red-50"><div className="flex items-center gap-2 font-medium text-red-800"><AlertCircle className="h-5 w-5" />Could not load records</div><p className="mt-2 text-sm text-red-700">{query.error?.response?.data?.error?.message || query.error?.message || 'Please try again.'}</p><button type="button" className="btn-secondary mt-4" onClick={() => query.refetch()}>Try again</button></div>;
  if (empty) return <div className="admin-panel py-14 text-center"><Inbox className="mx-auto mb-3 h-8 w-8 text-stone-300" /><p className="text-sm text-stone-500">{emptyText}</p></div>;
  return null;
}

export function AdminMutationFeedback({ mutations = [] }) {
  const failed = mutations.find((mutation) => mutation.isError);
  if (failed) return <p role="alert" className="my-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">{failed.error?.response?.data?.error?.message || failed.error?.message || 'The change could not be saved.'}</p>;
  if (mutations.some((mutation) => mutation.isPending)) return <p role="status" className="my-4 text-sm text-stone-500">Saving changes...</p>;
  if (mutations.some((mutation) => mutation.isSuccess)) return <p role="status" className="my-4 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">Changes saved.</p>;
  return null;
}

export function AdminPagination({ page, limit, total, onPage, pending }) {
  const pages = Math.max(1, Math.ceil(total / limit));
  return <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm"><p className="text-stone-500">{total ? `${(page - 1) * limit + 1}-${Math.min(page * limit, total)} of ${total} records` : '0 records'}</p><div className="flex items-center gap-3"><button className="btn-secondary" disabled={page <= 1 || pending} onClick={() => onPage(page - 1)}>Previous</button><span>Page {page} of {pages}</span><button className="btn-secondary" disabled={page >= pages || pending} onClick={() => onPage(page + 1)}>Next</button></div></div>;
}
