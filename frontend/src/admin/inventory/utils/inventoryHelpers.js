export function stockStatus(item) {
  const available = Number(item?.AvailableQuantity ?? 0);
  const reorderLevel = Number(item?.ReorderLevel ?? 0);
  if (available <= 0) return { label: 'Out of stock', className: 'bg-red-50 text-red-700 border-red-200' };
  if (available <= reorderLevel) return { label: 'Low stock', className: 'bg-amber-50 text-amber-800 border-amber-200' };
  return { label: 'In stock', className: 'bg-green-50 text-green-700 border-green-200' };
}

export function formatNumber(value) {
  return new Intl.NumberFormat('en-IN').format(Number(value || 0));
}

export function formatDate(value) {
  if (!value) return 'Not set';
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

export function productLabel(item) {
  return [item?.ProductName, item?.VariantName || item?.SKU].filter(Boolean).join(' - ');
}
