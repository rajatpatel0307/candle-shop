import { ArrowUpRight, Inbox, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
export function CustomerPageHeading({eyebrow,title,description,actions}) {
  return <div className="customer-page-heading"><div><p className="home-eyebrow">{eyebrow || 'Your Candle Studio'}</p><h1>{title}</h1>{description && <p className="mt-3 max-w-xl text-sm leading-7 text-[#796c5c]">{description}</p>}</div>{actions}</div>;
}
export function CustomerQueryState({query,empty=false,title='Nothing here just yet.',description,children}) {
  if(query.isPending)return <div role="status" className="customer-panel flex items-center gap-3 py-10 text-sm text-[#796c5c]"><RefreshCw className="h-4 w-4 animate-spin" />Loading your details...</div>;
  if(query.isError)return <div role="alert" className="customer-panel"><h2 className="text-xl">We couldn't load this just now.</h2><p className="mt-3 text-sm text-[#796c5c]">{query.error?.response?.data?.error?.message || 'Please try again in a moment.'}</p><button type="button" className="btn-secondary mt-5" onClick={() => query.refetch()}>Try again</button></div>;
  if(empty)return <div className="customer-panel py-12 text-center"><Inbox className="mx-auto mb-5 h-7 w-7 text-[#9a7958]" strokeWidth={1.2} /><h2 className="text-2xl">{title}</h2>{description && <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-[#796c5c]">{description}</p>}{children}</div>;
  return null;
}
export function CustomerPagination({page,total,limit=20,pending,onPage}) {
  const pages=Math.max(1,Math.ceil((total || 0)/limit));
  if(pages<=1)return null;
  return <div className="mt-7 flex items-center justify-between gap-3 border-t border-[#e4dacd] pt-5 text-xs text-[#796c5c]"><p>Page {page} of {pages}</p><div className="flex gap-2"><button className="btn-secondary" disabled={page<=1 || pending} onClick={() => onPage(page-1)}>Previous</button><button className="btn-secondary" disabled={page>=pages || pending} onClick={() => onPage(page+1)}>Next</button></div></div>;
}
export function ContinueShoppingLink(){return <Link to="/shop" className="home-text-link inline-flex items-center gap-3">Explore the collection<ArrowUpRight className="h-4 w-4" /></Link>;}
