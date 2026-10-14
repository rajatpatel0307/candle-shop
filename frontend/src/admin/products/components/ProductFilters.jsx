import { Search } from 'lucide-react';

export function ProductFilters({ search, status, featured, onSearch, onStatus, onFeatured }) {
  return (
    <section className="grid gap-3 md:grid-cols-[1fr_12rem_12rem]">
      <label className="flex items-center gap-2 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm shadow-sm focus-within:border-[#b56b45] focus-within:ring-2 focus-within:ring-[#b56b45]/20">
        <Search className="h-4 w-4 text-stone-500" />
        <input className="w-full bg-transparent outline-none" value={search || ''} onChange={(e) => onSearch(e.target.value)} placeholder="Search name, slug, or status" />
      </label>
      <select className="input" value={status} onChange={(e) => onStatus(e.target.value)}>
        <option value="all">All statuses</option>
        <option value="Active">Active</option>
        <option value="Draft">Draft</option>
        <option value="Archived">Archived</option>
      </select>
      <select className="input" value={featured} onChange={(e) => onFeatured(e.target.value)}>
        <option value="all">All products</option>
        <option value="featured">Featured only</option>
        <option value="standard">Not featured</option>
      </select>
    </section>
  );
}
