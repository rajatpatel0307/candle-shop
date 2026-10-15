import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../services/apiClient.js';
import { NotificationComposer } from '../components/NotificationComposer.jsx';
import { AdminPageHeader, AdminPagination, AdminQueryState, AdminMutationFeedback } from '../../shared/AdminUi.jsx';
import { formatDate } from '../../../features/orders/utils/ordersHelpers.js';
export function ManageNotifications() {
  const qc = useQueryClient();
  const [page,setPage] = useState(1);
  const [composerVersion,setComposerVersion] = useState(0);
  const q = useQuery({ queryKey:['admin-notifications',page], queryFn:async () => (await apiClient.get('/admin/notifications',{params:{page,limit:20}})).data.data.notifications });
  const send = useMutation({ mutationFn:(payload) => apiClient.post('/admin/notifications',payload), onSuccess:() => {setComposerVersion((version) => version+1);qc.invalidateQueries({queryKey:['admin-notifications']});} });
  const rows = q.data?.items || [];
  return <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6"><AdminPageHeader title="Notifications" description="Send a customer a notification and review the store's notification history." /><AdminMutationFeedback mutations={[send]} /><div className="grid items-start gap-5 xl:grid-cols-[1fr_340px]"><div><AdminQueryState query={q} empty={!rows.length} emptyText="No notifications have been sent yet." />{!q.isPending && !q.isError && rows.length > 0 && <><section className="admin-panel divide-y">{rows.map((notification) => <article key={notification.NotificationId} className="py-4"><div className="flex flex-wrap justify-between gap-2"><h2 className="text-sm font-semibold">{notification.Title}</h2><time className="text-xs text-stone-400">{formatDate(notification.CreatedAtUtc)}</time></div><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-stone-600">{notification.Message}</p><p className="mt-2 text-xs text-stone-400">{notification.Email || notification.UserId} / {notification.ReadAtUtc ? 'Read':'Unread'}</p></article>)}</section><AdminPagination page={page} limit={20} total={q.data.pagination.total} onPage={setPage} /></>}</div><NotificationComposer key={composerVersion} pending={send.isPending} onSubmit={(payload) => send.mutate(payload)} /></div></main>;
}
