export function LowStockWidget({ items = [] }) {
  return <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm"><h2 className="text-xl font-semibold">Low stock</h2><div className="mt-4 space-y-3">{items.map((item) => <div key={item.ProductVariantId} className="flex justify-between gap-3 text-sm"><span>{item.ProductName} {item.SKU}</span><span className="font-semibold">{item.AvailableQuantity} left</span></div>)}</div></section>;
}
