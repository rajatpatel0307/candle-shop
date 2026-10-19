import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Banknote, CheckCircle2, FileText, Package, RefreshCw } from 'lucide-react';
import { adminReportsApi } from '../api/adminReportsApi.js';
import { ReportExport } from '../components/ReportExport.jsx';
import { ReportTable } from '../components/ReportTable.jsx';
import { AdminQueryState } from '../../shared/AdminUi.jsx';
import { AdminSearchField, AdminSummaryCards, AdminTableHeading } from '../../shared/AdminListOverview.jsx';
import { currency } from '../../../features/orders/utils/ordersHelpers.js';

function reportCards(type,rows) {
 const sum=key=>rows.reduce((total,row)=>total+Number(row[key]||0),0);
 const count=(key,value)=>rows.filter(row=>row[key]===value).length;
 const card=(label,value,icon=FileText)=>({label,value:typeof value==='number'?value.toLocaleString('en-IN'):value,icon});
 if(type==='revenue')return [card('Days reported',rows.length),card('Total revenue',currency(sum('Value')),Banknote),card('Highest daily revenue',currency(Math.max(0,...rows.map(row=>Number(row.Value||0)))),Banknote),card('Average daily revenue',currency(rows.length?sum('Value')/rows.length:0),Banknote)];
 if(type==='products')return [card('Products in report',rows.length,Package),card('Units sold',sum('UnitsSold'),Package),card('Sales value',currency(sum('Sales')),Banknote),card('Average per unit',currency(sum('UnitsSold')?sum('Sales')/sum('UnitsSold'):0),Banknote)];
 if(type==='inventory')return [card('Low-stock records',rows.length,Package),card('Available units',sum('AvailableQuantity'),Package),card('Reserved units',sum('ReservedQuantity'),Package),card('Out-of-stock records',rows.filter(row=>Number(row.AvailableQuantity)<=0).length,Package)];
 if(type==='refunds')return [card('Refunds in report',rows.length),card('Completed refunds',count('RefundStatus','SUCCEEDED'),CheckCircle2),card('Completed amount',currency(rows.filter(row=>row.RefundStatus==='SUCCEEDED').reduce((total,row)=>total+Number(row.RefundAmount||0),0)),Banknote),card('Requested amount',currency(sum('RefundAmount')),Banknote)];
 return [card('Orders in report',rows.length),card('Paid orders',count('PaymentStatus','SUCCEEDED'),CheckCircle2),card('Order value / all statuses',currency(sum('GrandTotal')),Banknote),card('Cancelled orders',count('OrderStatus','CANCELLED'))];
}

export function AdminReportsPage() {
 const [type,setType]=useState('sales'),[range,setRange]=useState('last30'),[from,setFrom]=useState(''),[to,setTo]=useState(''),[search,setSearch]=useState('');
 const valid=range!=='custom'||Boolean(from&&to&&from<=to);
 const params=range==='custom'&&valid?{range,from,to:new Date(new Date(`${to}T00:00:00Z`).getTime()+86400000).toISOString()}:{range};
 const q=useQuery({queryKey:['admin-report',type,params],enabled:valid,queryFn:async()=>(await adminReportsApi.report(type,params)).data.data.report.rows});
 const rows=q.data||[],matches=rows.filter(row=>Object.values(row).some(value=>String(value??'').toLowerCase().includes(search.toLowerCase().trim())));
 return <main className="mx-auto max-w-[1500px] px-4 py-10 sm:px-7"><h1 className="sr-only">Reports</h1>
  <section className="mb-6" aria-label="Report summary"><div className="mb-3 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl">Reports overview</h2><p className="mt-1 text-[11px] text-stone-500">Totals from the selected report and reporting period</p></div><div className="flex flex-wrap gap-2"><button type="button" className="btn-secondary" disabled={!valid||q.isFetching} onClick={()=>q.refetch()}><RefreshCw className={`h-3.5 w-3.5 ${q.isFetching?'animate-spin':''}`}/>Refresh</button><ReportExport type={type} params={params} disabled={!valid||!q.isSuccess||!rows.length}/></div></div>{valid?<AdminSummaryCards query={q} items={reportCards(type,rows)}/>:<p role="status" className="admin-panel text-sm text-amber-800">Choose a valid start and end date to load the report.</p>}</section>
  <section className="admin-panel mb-5 flex flex-wrap items-end gap-4"><AdminSearchField label="Search report" placeholder="Search values in the current report" value={search} onChange={setSearch}/>
   <label className="text-xs font-medium text-stone-500">Report<select className="input mt-2 capitalize sm:w-40" value={type} onChange={event=>{setType(event.target.value);setSearch('');}}>{['sales','revenue','orders','products','inventory','refunds'].map(option=><option key={option} value={option}>{option==='inventory'?'Low-stock inventory':option}</option>)}</select></label>
   <label className="text-xs font-medium text-stone-500">Time period<select className="input mt-2 sm:w-44" value={range} onChange={event=>setRange(event.target.value)}>{[['today','Today'],['last7','Last 7 days'],['last30','Last 30 days'],['currentMonth','This month'],['previousMonth','Last month'],['custom','Custom dates']].map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label>
   {range==='custom'&&<><label className="text-xs font-medium text-stone-500">From<input type="date" className="input mt-2" value={from} max={to||undefined} onChange={event=>setFrom(event.target.value)}/></label><label className="text-xs font-medium text-stone-500">To<input type="date" className="input mt-2" value={to} min={from||undefined} onChange={event=>setTo(event.target.value)}/></label></>}
   <button type="button" className="btn-secondary" disabled={!search&&type==='sales'&&range==='last30'} onClick={()=>{setSearch('');setType('sales');setRange('last30');setFrom('');setTo('');}}>Clear filters</button>
  </section>
  <p className="mb-4 text-[11px] text-stone-500">Cards and CSV cover the full selected report; search filters the table. Amounts in INR.{type==='inventory'?' Current low-stock records (up to 200); date filters apply to transaction reports.':''}{type==='products'?' Top 10 product variants by units sold from paid orders.':''}</p>
  {valid&&<><AdminQueryState query={q}/>{q.isSuccess&&<section className="overflow-hidden rounded border border-[#e4dacd] bg-[#fffdf8]"><AdminTableHeading title="Report results" count={matches.length}/>{matches.length?<ReportTable rows={matches}/>:<p className="px-5 py-12 text-center text-sm text-stone-500">No report rows match the selected period and search.</p>}</section>}</>}
 </main>;
}
