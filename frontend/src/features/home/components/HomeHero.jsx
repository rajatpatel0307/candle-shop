import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { BannerCarousel } from './BannerCarousel.jsx';

export function HomeHero({ banners = [] }) {
  if (banners.length) return <BannerCarousel banners={banners} />;
  return (
    <section className="relative min-h-[72vh] overflow-hidden bg-stone-900 text-white">
      <img src="https://images.unsplash.com/photo-1605651202774-7d573fd3f12d?auto=format&fit=crop&w=1800&q=80" alt="Lit candles on a table" className="absolute inset-0 h-full w-full object-cover opacity-60" />
      <div className="relative mx-auto flex min-h-[72vh] max-w-7xl flex-col justify-end px-4 pb-16 pt-24 sm:px-6">
        <p className="mb-3 flex items-center gap-2 text-sm font-medium uppercase"><Sparkles className="h-4 w-4" /> Scented candles, gifts, and care essentials</p>
        <h1 className="max-w-3xl text-5xl font-semibold leading-tight md:text-7xl">Candle Studio</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-100">A warm storefront for candle collections, gift sets, care essentials, and slow evenings.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/shop" className="btn-primary">Shop collection</Link>
          <Link to="/about" className="btn-secondary">Our story</Link>
        </div>
      </div>
    </section>
  );
}
