import { useQuery } from '@tanstack/react-query';
import { Archive, CheckCircle2, Clock3, FileText, Image, Layers, Package, RefreshCw, Search, ShieldCheck, ShoppingBag, Star, Truck, XCircle } from 'lucide-react';
import { apiClient } from '../../services/apiClient.js';

const cards = {
  customers: [['total','Total customers',ShoppingBag],['active','Active accounts',CheckCircle2],['inactive','Other account statuses',Archive],['verified','Verified emails',ShieldCheck]],
  reviews: [['total','Total reviews',Star],['published','Published reviews',CheckCircle2],['hidden','Hidden reviews',Archive],['removed','Removed reviews',XCircle]],
  tickets: [['total','Total tickets',FileText],['openTickets','Open tickets',FileText],['inProgress','In progress',Clock3],['waiting','Waiting for customer',Clock3],['completed','Resolved / closed',CheckCircle2]],
  notifications: [['total','Total notifications',FileText],['readCount','Read notifications',CheckCircle2],['unread','Unread notifications',Clock3],['recipients','Recipients',ShoppingBag]],
  banners: [['total','Total banners',Image],['published','Published banners',CheckCircle2],['draft','Draft banners',FileText],['archived','Archived banners',Archive]],
  'shipping-settings': [['total','Total rates',Truck],['active','Active rates',CheckCircle2],['zones','Shipping zones',Layers],['methods','Delivery methods',Package]],
  settings: [['total','Total settings',FileText],['publicCount','Public settings',CheckCircle2],['privateCount','Private settings',ShieldCheck],['jsonCount','JSON settings',FileText]],
  products: [['total','Total products',Package],['active','Active products',CheckCircle2],['draft','Draft products',FileText],['archived','Archived products',Archive],['featured','Featured products',Star]],
  categories: [['total','Total categories',Layers],['active','Active categories',CheckCircle2],['inactive','Inactive categories',Archive],['topLevel','Top-level categories',Layers]],
  brands: [['total','Total brands',ShoppingBag],['active','Active brands',CheckCircle2],['inactive','Inactive brands',Archive],['withLogo','With a logo',Image]],
  orders: [['total','Total orders',ShoppingBag],['processing','To fulfil',Clock3],['shipped','Shipped orders',Truck],['delivered','Delivered orders',CheckCircle2],['cancelled','Cancelled orders',XCircle]],
  refunds: [['total','Total refunds',FileText],['pending','Pending / approved',Clock3],['processing','Processing refunds',RefreshCw],['succeeded','Completed refunds',CheckCircle2],['failed','Failed refunds',XCircle]],
  shipments: [['total','Total shipments',Package],['awaiting','Awaiting dispatch',Clock3],['inTransit','In transit',Truck],['delivered','Delivered shipments',CheckCircle2],['exceptions','Delivery exceptions',XCircle]],
  'audit-logs': [['total','Total events',ShieldCheck],['success','Successful events',CheckCircle2],['failure','Failed events',XCircle],['denied','Denied events',Archive]],
};
const tones=['bg-[#62684f] text-[#fff9ed]','bg-emerald-50 text-emerald-800','bg-amber-50 text-amber-800','bg-blue-50 text-blue-800','bg-stone-100 text-stone-600'];

export function AdminSummaryCards({items,query}) {
  return <><div className={`grid gap-3 sm:grid-cols-2 ${items.length===5 ? 'xl:grid-cols-5':'xl:grid-cols-4'}`} aria-busy={query.isPending}>{items.map(({label,value,icon:Icon=FileText},index)=><article key={label} className={`min-w-0 rounded border p-5 ${index===0 ? 'border-[#62684f] bg-[#62684f] text-[#fff9ed]' : 'border-[#e4dacd] bg-[#fffdf8]'}`}><div className="flex items-center justify-between gap-2"><p className={`text-xs ${index===0 ? 'text-[#eee4d0]':'text-stone-500'}`}>{label}</p><span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded ${tones[index%tones.length]}`}><Icon className="h-4 w-4" strokeWidth={1.5}/></span></div><p className="mt-5 break-words font-serif text-4xl tabular-nums tracking-tight">{query.isSuccess ? value : '--'}</p></article>)}</div>{query.isPending && <p role="status" className="mt-3 text-xs text-stone-500">Loading totals...</p>}{query.isError && <p role="alert" className="mt-3 text-xs text-red-700">Totals could not be loaded. <button type="button" className="underline" onClick={()=>query.refetch()}>Retry totals</button></p>}</>;
}

export function AdminListOverview({section,title,actions,onRefresh,pending=false}) {
  const query=useQuery({queryKey:['admin-list-summary',section],queryFn:async()=>(await apiClient.get(`/admin/list-summaries/${section}`)).data.data.summary,refetchInterval:30000});
  return <section className="mb-6" aria-label={`${title} summary`}><h1 className="sr-only">{title}</h1><div className="mb-3 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl">{title} overview</h2><p className="mt-1 text-[11px] text-stone-500">All records, across every page and status</p></div><div className="flex flex-wrap gap-2"><button type="button" className="btn-secondary" disabled={pending||query.isFetching} onClick={()=>{query.refetch();onRefresh?.();}}><RefreshCw className={`h-3.5 w-3.5 ${pending||query.isFetching ? 'animate-spin':''}`}/>Refresh</button>{actions}</div></div><AdminSummaryCards query={query} items={cards[section].map(([key,label,icon])=>({label,icon,value:Number(query.data?.[key]??0).toLocaleString('en-IN')}))}/></section>;
}

export function AdminTableHeading({title,count,icon:Icon=FileText}) {
  return <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e4dacd] px-5 py-4"><div className="flex items-center gap-2"><Icon className="h-4 w-4 text-[#89765e]"/><h2 className="text-lg">{title}</h2></div>{count!==undefined && <p className="text-[11px] text-stone-500">{count} displayed</p>}</div>;
}

export function AdminSearchField({label,placeholder,value,onChange}) {
  return <label className="block min-w-[min(100%,16rem)] flex-1 text-xs font-medium text-stone-500">{label}<div className="relative mt-2"><Search className="pointer-events-none absolute left-3 top-3 h-4 w-4" strokeWidth={1.5}/><input type="search" aria-label={label} className="input w-full pl-10" placeholder={placeholder} value={value||''} onChange={event=>onChange(event.target.value)}/></div></label>;
}
