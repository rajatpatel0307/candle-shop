import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCheck } from 'lucide-react';
import { notificationsApi } from '../notifications.api.js';
import { NotificationList } from '../components/NotificationList.jsx';
import { useAuth } from '../../auth/hooks/useAuth.js';
import { CustomerPageHeading, CustomerQueryState, CustomerPagination } from '../../../shared/components/CustomerUi.jsx';
export function NotificationsPage(){
 const qc=useQueryClient();const {user}=useAuth();const [page,setPage]=useState(1);
 const q=useQuery({queryKey:['notifications',user?.id,page],queryFn:async()=>(await notificationsApi.list({page,limit:20})).data.data.notifications});
 const refresh=()=>{for(const key of ['notifications','notifications-unread','notifications-preview'])qc.invalidateQueries({queryKey:[key]});};
 const mark=useMutation({mutationFn:notificationsApi.markRead,onSuccess:refresh});const all=useMutation({mutationFn:notificationsApi.markAllRead,onSuccess:refresh});const rows=q.data?.items || [];
 return <main><CustomerPageHeading eyebrow="A note from the studio" title="Your updates." description="Order news, replies, and the little things worth keeping up with." actions={rows.some((item)=>!item.ReadAtUtc) && <button className="btn-secondary" disabled={mark.isPending || all.isPending} onClick={()=>all.mutate()}><CheckCheck className="h-4 w-4"/>Mark all read</button>}/><CustomerQueryState query={q} empty={!rows.length} title="All quiet for now." description="Order updates and replies from the studio will appear here."/>{(mark.isError || all.isError) && <p role="alert" className="mb-5 text-sm text-red-700">Could not update your notifications. Please try again.</p>}{!q.isPending && !q.isError && rows.length>0 && <NotificationList items={rows} onRead={(id)=>{if(!mark.isPending && !all.isPending)mark.mutate(id);}}/>}<CustomerPagination page={page} total={q.data?.pagination.total} pending={q.isFetching} onPage={setPage}/></main>;
}
