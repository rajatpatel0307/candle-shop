import { currency } from '../../../features/orders/utils/ordersHelpers.js';

export function TopProductsTable({ products = [] }) {
  return <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm"><h2 className="text-xl font-semibold">Top products</h2><div className="mt-4 space-y-3">{products.map((product) => <div key={`${product.ProductNameSnapshot}-${product.SKU}`} className="flex justify-between gap-3 text-sm"><span className="font-semibold">{product.ProductNameSnapshot}</span><span>{product.UnitsSold} units</span><span>{currency(product.Sales)}</span></div>)}</div></section>;
}
