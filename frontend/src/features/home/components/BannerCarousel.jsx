import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { BannerSlide } from './BannerSlide.jsx';
import { eligibleItems } from '../home.utils.js';

export function BannerCarousel({ banners = [] }) {
  const slides = useMemo(() => eligibleItems(banners), [banners]);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;

  useEffect(() => {
    if (count <= 1 || paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % count), 5500);
    return () => window.clearInterval(timer);
  }, [count, paused]);

  if (!count) return null;

  const move = (direction) => setIndex((current) => (current + direction + count) % count);

  return (
    <section className="relative min-h-[72vh] overflow-hidden bg-stone-900 text-white" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      {slides.map((slide, slideIndex) => <BannerSlide key={slide.id || slide.title} slide={slide} active={slideIndex === index} />)}
      {count > 1 && (
        <div className="absolute inset-x-0 bottom-6 z-10 mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6">
          <button className="icon-btn bg-white/90" type="button" aria-label="Previous banner" onClick={() => move(-1)}><ChevronLeft className="h-4 w-4" /></button>
          <div className="flex gap-2">
            {slides.map((slide, slideIndex) => <button key={slide.id || slide.title} className={`h-2.5 w-2.5 rounded-full ${slideIndex === index ? 'bg-white' : 'bg-white/50'}`} type="button" aria-label={`Show banner ${slideIndex + 1}`} onClick={() => setIndex(slideIndex)} />)}
          </div>
          <button className="icon-btn bg-white/90" type="button" aria-label="Next banner" onClick={() => move(1)}><ChevronRight className="h-4 w-4" /></button>
        </div>
      )}
    </section>
  );
}
