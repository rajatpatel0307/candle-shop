import { ChevronLeft, ChevronRight } from 'lucide-react';

export function InventoryPagination({ pagination, onPageChange }) {
  const page = pagination?.page || 1;
  const limit = pagination?.limit || 20;
  const total = pagination?.total || 0;
  const lastPage = Math.max(Math.ceil(total / limit), 1);

  return (
    <div className="flex items-center justify-between gap-3 border-t border-stone-200 bg-white px-4 py-3 text-sm">
      <span className="text-stone-500">Page {page} of {lastPage}</span>
      <div className="flex gap-2">
        <button className="icon-btn" disabled={page <= 1} onClick={() => onPageChange(page - 1)} aria-label="Previous page">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button className="icon-btn" disabled={page >= lastPage} onClick={() => onPageChange(page + 1)} aria-label="Next page">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
