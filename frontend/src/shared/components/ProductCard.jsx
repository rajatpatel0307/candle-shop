import { Link } from 'react-router-dom';
import { ArrowRight, Flame } from 'lucide-react';

function currency(value) {
  if (value === null || value === undefined || value === '') return 'Price pending';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(value));
}

export function ProductCard({ product }) {
  const slug = product.Slug || product.slug;
  const name = product.ProductName || product.productName;
  const description = product.ShortDescription || product.shortDescription;
  const category = product.CategoryName || product.categoryName || 'Candle';
  const imageUrl = product.ImageUrl || product.imageUrl;
  const price = product.SellingPrice ?? product.sellingPrice;

  return (
    <Link to={`/products/${slug}`} className="group overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="aspect-[4/3] bg-stone-100">
        {imageUrl ? <img src={imageUrl} alt={name} className="h-full w-full object-cover" loading="lazy" /> : <div className="flex h-full items-center justify-center"><Flame className="h-10 w-10 text-[#b56b45]" /></div>}
      </div>
      <div className="space-y-2 p-4">
        <p className="text-xs uppercase text-[#697565]">{category}</p>
        <h3 className="text-lg font-semibold leading-snug">{name}</h3>
        <p className="line-clamp-2 min-h-10 text-sm text-stone-600">{description}</p>
        <div className="flex items-center justify-between pt-2">
          <span className="font-semibold">{currency(price)}</span>
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}
