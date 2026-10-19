import { useState } from 'react';
import { RefreshCw, Package, ShieldCheck, AlertTriangle, XCircle } from 'lucide-react';
import { AdminQueryState } from '../../shared/AdminUi.jsx';
import { AdminSummaryCards } from '../../shared/AdminListOverview.jsx';
import { InventoryFilters } from '../components/InventoryFilters.jsx';
import { InventoryPagination } from '../components/InventoryPagination.jsx';
import { InventoryTable } from '../components/InventoryTable.jsx';
import { useInventory,useInventorySummary } from '../hooks/useInventory.js';
export function InventoryDashboard(){
 const [filters,setFilters]=useState({page:1,limit:20,status:'all',sortBy:'product',sortDir:'asc'});
 const summary=useInventorySummary(),query=useInventory(filters),pending=summary.isFetching||query.isFetching;
 const items=[['Total records','TotalRecords',Package],['Available units','TotalAvailable',Package],['Reserved units','TotalReserved',ShieldCheck],['Low-stock records','LowStockItems',AlertTriangle],['Out-of-stock records','OutOfStockItems',XCircle]].map(([label,key,icon])=>({label,icon,value:Number(summary.data?.[key]||0).toLocaleString('en-IN')}));
 return <main className="mx-auto max-w-[1500px] px-4 py-10 sm:px-7"><h1 className="sr-only">Inventory</h1><section className="mb-6" aria-label="Inventory summary"><div className="mb-3 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl">Inventory overview</h2><p className="mt-1 text-[11px] text-stone-500">Current stock across every product and variant</p></div><button type="button" className="btn-secondary" disabled={pending} onClick={()=>{summary.refetch();query.refetch();}}><RefreshCw className={`h-3.5 w-3.5 ${pending?'animate-spin':''}`}/>Refresh</button></div><AdminSummaryCards query={summary} items={items}/></section><div className="grid gap-5"><InventoryFilters filters={filters} onChange={setFilters}/><AdminQueryState query={query}/>{query.isSuccess&&<><InventoryTable items={query.data?.items||[]}/><InventoryPagination pagination={query.data?.pagination} onPageChange={page=>setFilters({...filters,page})}/></>}</div></main>;
}
