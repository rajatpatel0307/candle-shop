import { useState } from 'react';
import { AdminOrdersTable } from '../components/AdminOrdersTable.jsx';
import { useAdminOrders } from '../hooks/useAdminOrders.js';
import { AdminListOverview, AdminSearchField } from '../../shared/AdminListOverview.jsx';
import { AdminPagination, AdminQueryState } from '../../shared/AdminUi.jsx';
export function AdminOrdersPage() {
 const initial={page:1,limit:20,search:'',status:'',paymentStatus:''};
 const [filters,setFilters]=useState(initial);
 const query=useAdminOrders({...filters,status:filters.status||undefined,paymentStatus:filters.paymentStatus||undefined});
 const change=(key,value)=>setFilters(current=>({...current,[key]:value,page:1}));
 const rows=query.data?.items||[];
 return <main className="mx-auto max-w-[1500px] px-4 py-10 sm:px-7">
  <AdminListOverview section="orders" title="Orders" pending={query.isFetching} onRefresh={()=>query.refetch()}/>
  <section className="admin-panel mb-5 flex flex-wrap items-end gap-4">
   <AdminSearchField label="Search orders" placeholder="Order number or customer" value={filters.search} onChange={value=>change('search',value)}/>
   <label className="text-xs font-medium text-stone-500">Order status<select className="input mt-2 sm:w-44" value={filters.status} onChange={event=>change('status',event.target.value)}><option value="">All statuses</option>{['PENDING_PAYMENT','CONFIRMED','PROCESSING','READY_TO_SHIP','SHIPPED','DELIVERED','CANCELLED'].map(status=><option key={status} value={status}>{status.replaceAll('_',' ')}</option>)}</select></label>
   <label className="text-xs font-medium text-stone-500">Payment status<select className="input mt-2 sm:w-44" value={filters.paymentStatus} onChange={event=>change('paymentStatus',event.target.value)}><option value="">All payments</option>{['PENDING','PROCESSING','SUCCEEDED','FAILED','REFUNDED'].map(status=><option key={status}>{status}</option>)}</select></label>
   <button type="button" className="btn-secondary" disabled={!filters.search&&!filters.status&&!filters.paymentStatus} onClick={()=>setFilters(initial)}>Clear filters</button>
  </section>
  <AdminQueryState query={query}/>
  {query.isSuccess && <><AdminOrdersTable orders={rows}/><AdminPagination page={filters.page} limit={20} total={query.data?.pagination?.total||0} pending={query.isFetching} onPage={page=>setFilters(current=>({...current,page}))}/></>}
 </main>;
}
