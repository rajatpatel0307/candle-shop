import { AdminTableHeading } from '../../shared/AdminListOverview.jsx';
import { Archive, Edit3, Eye, Star, Trash2 } from 'lucide-react';
import { ProductStatusControl } from './ProductStatusControl.jsx';

export function AdminProductTable({ products = [], loading, onEdit, onDelete, onStatus, onFeatured }) {
  return (
    <section className="overflow-hidden rounded-md border border-stone-200 bg-white shadow-sm">
      <AdminTableHeading title="Product catalog" count={products.length}/>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="bg-stone-100 text-xs uppercase text-stone-600">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Featured</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td className="px-4 py-10 text-center text-stone-500" colSpan={6}>Loading products...</td>
              </tr>
            )}
            {!loading && products.length === 0 && (
              <tr>
                <td className="px-4 py-10 text-center text-stone-500" colSpan={6}>No products found.</td>
              </tr>
            )}
            {!loading && products.map((product) => (
              <tr key={product.ProductId} className="border-t border-stone-100 align-top">
                <td className="px-4 py-4">
                  <p className="font-semibold text-[#2f2722]">{product.ProductName || 'Untitled product'}</p>
                  <p className="mt-1 line-clamp-2 max-w-md text-xs text-stone-500">{product.ShortDescription || product.Description || 'No description added.'}</p>
                </td>
                <td className="px-4 py-4 font-mono text-xs text-stone-600">{product.Slug}</td>
                <td className="px-4 py-4">{product.ProductType || 'CANDLE'}</td>
                <td className="px-4 py-4"><ProductStatusControl status={product.ProductStatus} /></td>
                <td className="px-4 py-4">
                  <button className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${product.IsFeatured ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-stone-200 bg-stone-50 text-stone-500'}`} type="button" onClick={() => onFeatured(product)}>
                    <Star className="h-3.5 w-3.5" />
                    {product.IsFeatured ? 'Featured' : 'Standard'}
                  </button>
                </td>
                <td className="px-4 py-4">
                  <div className="flex justify-end gap-2">
                    <a className="icon-btn" href={`/products/${product.Slug}`} target="_blank" rel="noreferrer" aria-label="Preview product" title="Preview">
                      <Eye className="h-4 w-4" />
                    </a>
                    <button className="icon-btn" type="button" onClick={() => onEdit(product)} aria-label="Edit product" title="Edit">
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button className="icon-btn" type="button" onClick={() => onStatus(product, product.ProductStatus === 'Active' ? 'Draft' : 'Active')} aria-label="Toggle product status" title={product.ProductStatus === 'Active' ? 'Move to draft' : 'Publish'}>
                      <Archive className="h-4 w-4" />
                    </button>
                    <button className="icon-btn text-red-700" type="button" onClick={() => onDelete(product)} aria-label="Delete product" title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
