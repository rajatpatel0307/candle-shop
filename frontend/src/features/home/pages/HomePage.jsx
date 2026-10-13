import { useQuery } from '@tanstack/react-query';
import { Boxes } from 'lucide-react';
import { Link } from 'react-router-dom';
import { endpoints } from '../../../services/endpoints.js';
import { apiClient } from '../../../services/apiClient.js';
import { homeApi } from '../home.api.js';
import { HomeHero } from '../components/HomeHero.jsx';
import { PromotionalSection } from '../components/PromotionalSection.jsx';
import { FeaturedProducts } from '../components/FeaturedProducts.jsx';
import { HomeContentSkeleton } from '../components/HomeContentSkeleton.jsx';
import { eligibleItems } from '../home.utils.js';

export function HomePage() {
  const home = useQuery({ queryKey: ['content-home'], queryFn: async () => (await homeApi.getHome()).data.data, retry: false });
  const categories = useQuery({ queryKey: ['home-categories'], queryFn: async () => (await apiClient.get(endpoints.categories)).data.data, retry: false });
  const data = home.data || {};

  return (
    <main>
      <HomeHero banners={data.banners || []} />
      {home.isLoading && <HomeContentSkeleton />}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase text-[#697565]">Shop by collection</p>
            <h2 className="text-3xl font-semibold">Categories</h2>
          </div>
          <Link to="/categories" className="text-sm font-semibold text-[#8d5132]">View all</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {(categories.data || []).slice(0, 3).map((category) => (
            <Link key={category.CategoryId || category.Slug} to={`/shop?category=${category.Slug}`} className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
              <Boxes className="mb-6 h-6 w-6 text-[#b56b45]" />
              <h3 className="text-xl font-semibold">{category.CategoryName}</h3>
              <p className="mt-2 text-sm leading-6 text-stone-600">{category.Description}</p>
            </Link>
          ))}
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-5 px-4 pb-12 sm:px-6">
        {eligibleItems(data.promotions || []).map((section) => <PromotionalSection key={section.id} section={section} />)}
      </section>
      <FeaturedProducts products={data.featuredProducts || []} />
      {home.isError && <p className="mx-auto max-w-7xl px-4 pb-10 text-sm text-stone-600 sm:px-6">Content is using storefront fallbacks until Module 9 content is configured.</p>}
    </main>
  );
}
