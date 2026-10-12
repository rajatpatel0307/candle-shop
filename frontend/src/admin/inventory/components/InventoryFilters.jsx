import { Search } from 'lucide-react';

export function InventoryFilters({ filters, onChange }) {
  function update(next) {
    onChange({ ...filters, ...next, page: 1 });
  }

  return (
    <div className="grid gap-3 rounded-lg border border-stone-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_180px_180px]">
      <label className="flex items-center gap-2 rounded-md border border-stone-300 px-3 py-2 focus-within:border-[#b56b45]">
        <Search className="h-4 w-4 text-stone-500" />
        <input
          className="w-full bg-transparent text-sm outline-none"
          placeholder="Search product, SKU, variant"
          value={filters.search || ''}
          onChange={(event) => update({ search: event.target.value })}
        />
      </label>
      <select className="input" value={filters.status || 'all'} onChange={(event) => update({ status: event.target.value })}>
        <option value="all">All stock</option>
        <option value="in-stock">In stock</option>
        <option value="low-stock">Low stock</option>
        <option value="out-of-stock">Out of stock</option>
      </select>
      <select className="input" value={filters.sortBy || 'product'} onChange={(event) => update({ sortBy: event.target.value })}>
        <option value="product">Product</option>
        <option value="sku">SKU</option>
        <option value="available">Available</option>
        <option value="onHand">Physical stock</option>
        <option value="reserved">Reserved</option>
        <option value="reorderLevel">Reorder level</option>
      </select>
    </div>
  );
}
