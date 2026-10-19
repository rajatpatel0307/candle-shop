import { AdminSearchField } from '../../shared/AdminListOverview.jsx';
export function ProductFilters({search,status,featured,onSearch,onStatus,onFeatured}) {
 return <section className="admin-panel flex flex-wrap items-end gap-4">
  <AdminSearchField label="Search products" placeholder="Name, slug or status" value={search} onChange={onSearch}/>
  <label className="text-xs font-medium text-stone-500">Status<select className="input mt-2 sm:w-40" value={status} onChange={event=>onStatus(event.target.value)}><option value="all">All statuses</option><option value="Active">Active</option><option value="Draft">Draft</option><option value="Archived">Archived</option></select></label>
  <label className="text-xs font-medium text-stone-500">Placement<select className="input mt-2 sm:w-44" value={featured} onChange={event=>onFeatured(event.target.value)}><option value="all">All products</option><option value="featured">Featured only</option><option value="standard">Not featured</option></select></label>
  <button type="button" className="btn-secondary" disabled={!search && status==='all' && featured==='all'} onClick={()=>{onSearch('');onStatus('all');onFeatured('all');}}>Clear filters</button>
 </section>;
}
