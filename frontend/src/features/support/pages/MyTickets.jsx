import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, X } from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth.js';
import { supportApi } from '../support.api.js';
import { TicketForm } from '../components/TicketForm.jsx';
import { TicketList } from '../components/TicketList.jsx';
import { CustomerPageHeading, CustomerQueryState, CustomerPagination } from '../../../shared/components/CustomerUi.jsx';
export function MyTickets(){
 const qc=useQueryClient();const {user}=useAuth();const [open,setOpen]=useState(false);const [page,setPage]=useState(1);
 const q=useQuery({queryKey:['tickets',user?.id,page],queryFn:async()=>(await supportApi.list({page,limit:20})).data.data.tickets});
 const create=useMutation({mutationFn:supportApi.create,onSuccess:()=>{qc.invalidateQueries({queryKey:['tickets']});setOpen(false);setPage(1);}});const rows=q.data?.items || [];
 return <main><CustomerPageHeading eyebrow="Here for the little things" title="A little help." description="A question about an order or something in the collection? Start a conversation with the studio." actions={<button className="btn-primary" disabled={create.isPending} onClick={()=>{setOpen(!open);create.reset();}}>{open ? <X className="h-4 w-4"/>:<Plus className="h-4 w-4"/>}{open ? 'Close form':'Start a conversation'}</button>}/>{open && <div className="mb-7"><TicketForm pending={create.isPending} onSubmit={(payload)=>create.mutate(payload)}/></div>}{create.isError && <p role="alert" className="mb-5 text-sm text-red-700">{create.error?.response?.data?.error?.message || 'Could not send your question. Please try again.'}</p>}{create.isSuccess && <p role="status" className="customer-panel mb-5 text-sm">Your message is with us. You can follow the conversation below.</p>}<CustomerQueryState query={q} empty={!rows.length} title="No conversations yet." description="Whenever you need a hand, start a conversation above."/>{!q.isPending && !q.isError && rows.length>0 && <TicketList tickets={rows}/>}<CustomerPagination page={page} total={q.data?.pagination.total} pending={q.isFetching} onPage={setPage}/></main>;
}
