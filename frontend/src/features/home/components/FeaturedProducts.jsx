import { Link } from 'react-router-dom';
import { ProductCard } from '../../../shared/components/ProductCard.jsx';

export function FeaturedProducts({ products = [] }) {
  if (!products.length) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase text-[#697565]">Featured</p>
          <h2 className="text-3xl font-semibold">Ready to light</h2>
        </div>
        <Link to="/shop" className="text-sm font-semibold text-[#8d5132]">Shop all</Link>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {products.slice(0, 6).map((product) => <ProductCard key={product.id || product.ProductId || product.productId} product={product} />)}
      </div>
    </section>
  );
}
