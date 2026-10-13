import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '../notifications.api.js';
import { NotificationList } from '../components/NotificationList.jsx';
export function NotificationsPage() { const qc = useQueryClient(); const q = useQuery({ queryKey: ['notifications'], queryFn: async () => (await notificationsApi.list()).data.data.notifications.items }); const mark = useMutation({ mutationFn: notificationsApi.markRead, onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }) }); return <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6"><h1 className="text-4xl font-semibold">Notifications</h1><div className="mt-6"><NotificationList items={q.data || []} onRead={(id) => mark.mutate(id)} /></div></main>; }
