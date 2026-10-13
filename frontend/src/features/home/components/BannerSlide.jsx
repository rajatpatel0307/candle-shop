import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { heroImage } from '../home.utils.js';

export function BannerSlide({ slide, active }) {
  return (
    <article className={`absolute inset-0 transition-opacity duration-700 ${active ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>
      <picture>
        {slide.mobileImageUrl && <source media="(max-width: 640px)" srcSet={slide.mobileImageUrl} />}
        <img src={heroImage(slide)} alt={slide.altText || slide.title} className="absolute inset-0 h-full w-full object-cover opacity-65" loading={active ? 'eager' : 'lazy'} />
      </picture>
      <div className="absolute inset-0 bg-stone-950/30" />
      <div className="relative mx-auto flex min-h-[72vh] max-w-7xl flex-col justify-end px-4 pb-16 pt-24 sm:px-6">
        {slide.subtitle && <p className="mb-3 flex items-center gap-2 text-sm font-medium uppercase"><Sparkles className="h-4 w-4" /> {slide.subtitle}</p>}
        <h1 className="max-w-3xl text-5xl font-semibold leading-tight md:text-7xl">{slide.title}</h1>
        {slide.description && <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-100">{slide.description}</p>}
        <div className="mt-8 flex flex-wrap gap-3">
          {slide.buttonText && slide.buttonUrl && <Link to={slide.buttonUrl} className="btn-primary">{slide.buttonText}</Link>}
          {slide.secondaryButtonText && slide.secondaryButtonUrl && <Link to={slide.secondaryButtonUrl} className="btn-secondary">{slide.secondaryButtonText}</Link>}
        </div>
      </div>
    </article>
  );
}
