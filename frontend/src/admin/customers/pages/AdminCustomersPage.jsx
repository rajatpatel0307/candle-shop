import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminQueryState } from '../../shared/AdminUi.jsx';
import { AdminListOverview, AdminSearchField } from '../../shared/AdminListOverview.jsx';
import { adminCustomersApi } from '../api/adminCustomersApi.js';
import { CustomersTable } from '../components/CustomersTable.jsx';
export function AdminCustomersPage(){
 const [search,setSearch]=useState(''),[status,setStatus]=useState(''),[page,setPage]=useState(1);
 const query=useQuery({queryKey:['admin-customers',search,status,page],queryFn:async()=>(await adminCustomersApi.list({search,status,limit:21,offset:(page-1)*20})).data.data.customers});
 const rows=(query.data||[]).slice(0,20);
 return <main className="mx-auto max-w-[1500px] px-4 py-10 sm:px-7"><AdminListOverview section="customers" title="Customers" pending={query.isFetching} onRefresh={()=>query.refetch()}/><section className="admin-panel mb-5 flex flex-wrap items-end gap-4"><AdminSearchField label="Search customers" placeholder="Name, email or phone number" value={search} onChange={value=>{setSearch(value);setPage(1);}}/><label className="text-xs font-medium text-stone-500">Account status<select className="input mt-2 sm:w-52" value={status} onChange={event=>{setStatus(event.target.value);setPage(1);}}><option value="">All accounts</option><option value="Active">Active</option><option value="inactive">Other statuses</option></select></label><button type="button" className="btn-secondary" disabled={!search&&!status} onClick={()=>{setSearch('');setStatus('');setPage(1);}}>Clear filters</button></section><AdminQueryState query={query} empty={!rows.length} emptyText="No customer accounts match these filters."/>{query.isSuccess&&rows.length>0&&<CustomersTable rows={rows}/>}<div className="mt-5 flex items-center justify-between gap-3 text-xs"><span className="text-stone-500">Page {page} / {rows.length} displayed</span><div className="flex gap-2"><button className="btn-secondary" disabled={page<=1||query.isFetching} onClick={()=>setPage(page-1)}>Previous</button><button className="btn-secondary" disabled={!query.isSuccess||query.isFetching||(query.data?.length||0)<=20} onClick={()=>setPage(page+1)}>Next</button></div></div></main>;
}
