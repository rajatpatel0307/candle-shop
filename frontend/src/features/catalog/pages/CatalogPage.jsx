import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowUpRight, Search, X } from 'lucide-react';
import { apiClient } from '../../../services/apiClient.js';
import { endpoints } from '../../../services/endpoints.js';
import { HomeProductCard } from '../../home/components/HomeProductCard.jsx';
import { CustomerQueryState } from '../../../shared/components/CustomerUi.jsx';
export function CatalogPage() {
  const [params,setParams]=useSearchParams();
  const search=params.get('search') || '';
  const category=params.get('category') || '';
  const sort=params.get('sort') || 'featured';
  const page=Math.max(1,Math.min(100000,Math.floor(Number(params.get('page'))) || 1));
  const [draft,setDraft]=useState(search);
  useEffect(() => setDraft(search),[search]);
  const filters={search,category,sort,limit:13,offset:(page-1)*12};
  const q=useQuery({queryKey:['catalog-products',filters],queryFn:async () => (await apiClient.get(endpoints.products,{params:filters})).data.data,retry:false});
  const categories=useQuery({queryKey:['home-categories'],queryFn:async () => (await apiClient.get(endpoints.categories)).data.data,retry:false});
  const rows=(q.data || []).slice(0,12);
  const hasNext=(q.data?.length || 0)>12;
  const change=(key,value)=>{const next=new URLSearchParams(params);if(value)next.set(key,String(value));else next.delete(key);if(key!=='page')next.delete('page');setParams(next);};
  const selected=categories.data?.find((item) => item.Slug===category);
  return <main className="customer-catalog"><section className="customer-collection-hero"><div><p className="home-eyebrow">A little light for everyday living</p><h1>{selected?.CategoryName || 'The collection.'}</h1><p>For quiet evenings, thoughtful gestures, and the spaces you love. Find something that feels like you.</p><Link to="/about" className="home-text-link mt-5 inline-flex items-center gap-4">The Candle Studio story<ArrowUpRight className="h-4 w-4" /></Link></div><img src="/images/home/candle-atmosphere.jpg" alt="A warm candlelit moment" className="customer-collection-photo" /></section>
  <section className="customer-catalog-body"><div className="customer-catalog-toolbar"><form onSubmit={(event)=>{event.preventDefault();change('search',draft.trim());}} className="flex min-w-0 flex-1 items-center gap-3"><Search className="h-4 w-4 shrink-0 text-[#8b7053]" /><input type="search" aria-label="Search the collection" value={draft} onChange={(event)=>setDraft(event.target.value)} placeholder="Find your next favourite..." className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none" /><button className="text-xs font-medium text-[#70583f]" type="submit">Search</button></form><label className="flex items-center gap-3 text-xs text-[#796c5c]">Sort by<select aria-label="Sort products" className="bg-transparent py-3 pr-4 outline-none" value={sort} onChange={(event)=>change('sort',event.target.value)}><option value="featured">Featured</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option><option value="newest">Newest</option><option value="name">Name</option></select></label></div>
  <div className="mb-8 mt-5 flex flex-wrap items-center gap-2"><button aria-pressed={!category} className={`customer-filter ${!category ? 'is-active':''}`} onClick={()=>change('category','')}>All pieces</button>{categories.data?.map((item)=><button key={item.CategoryId} aria-pressed={category===item.Slug} className={`customer-filter ${category===item.Slug ? 'is-active':''}`} onClick={()=>change('category',item.Slug)}>{item.CategoryName}</button>)}{search && <button className="customer-filter flex items-center gap-2" onClick={()=>{setDraft('');change('search','');}}>Search: {search}<X className="h-3 w-3" /></button>}</div>
  <CustomerQueryState query={q} empty={!rows.length} title="A little further to find your favourite." description="No pieces match this selection. Try another search or explore the full collection."><button className="btn-secondary mt-5" onClick={()=>{setDraft('');setParams({});}}>Clear filters</button></CustomerQueryState>
  {!q.isPending && !q.isError && rows.length>0 && <><p className="mb-5 text-xs text-[#796c5c]">{rows.length} {rows.length===1 ? 'piece':'pieces'} in this selection</p><div className="grid grid-cols-1 gap-x-6 gap-y-10 min-[420px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{rows.map((product)=><HomeProductCard key={product.ProductId} product={product}/>)}</div></>}
  {!q.isPending && !q.isError && (page>1 || hasNext) && <div className="mt-10 flex items-center justify-between border-t border-[#e4dacd] pt-5 text-xs"><span>Page {page}</span><div className="flex gap-2"><button className="btn-secondary" disabled={page<=1 || q.isFetching} onClick={()=>change('page',page-1)}>Previous</button><button className="btn-secondary" disabled={!hasNext || q.isFetching} onClick={()=>change('page',page+1)}>Next</button></div></div>}
  </section></main>;
}
