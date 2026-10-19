import { ArrowUpRight, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';
import { heroImage } from '../home.utils.js';
export function BannerSlide({ slide, active, index = 0 }) {
  return <article aria-hidden={!active} inert={!active ? '' : undefined} className={`home-hero-slide ${active ? 'is-active' : ''}`}>
    <div className="home-hero-copy">
      <p className="home-eyebrow"><span className="inline-block h-px w-7 bg-current" />{slide.subtitle || 'A moment for yourself'}</p>
      {index === 0 ? <h1 className="home-display whitespace-pre-line">{slide.title}</h1> : <h2 className="home-display whitespace-pre-line">{slide.title}</h2>}
      {slide.description && <p className="home-hero-description">{slide.description}</p>}
      <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-5">
        <Link to={slide.buttonUrl || '/shop'} className="home-button">{slide.buttonText || 'Shop the collection'}<ArrowUpRight className="h-4 w-4" /></Link>
        <Link to={slide.secondaryButtonUrl || '/about'} className="home-text-link">{slide.secondaryButtonText || 'Our story'}</Link>
      </div>
      <p className="mt-10 flex items-center gap-2.5 text-[11px] tracking-wide text-[#807568]"><Flame className="h-4 w-4 text-[#a06843]" />A small ritual. A space that feels like you.</p>
    </div>
    <div className="home-hero-media"><picture>{slide.mobileImageUrl && <source media="(max-width:640px)" srcSet={slide.mobileImageUrl} />}<img src={heroImage(slide)} alt={slide.altText || slide.title} loading={index === 0 ? 'eager' : 'lazy'} fetchpriority={index === 0 ? 'high' : 'auto'} onError={(event) => {event.currentTarget.onerror=null;event.currentTarget.src='https://res.cloudinary.com/de1smdldp/image/upload/v1792133757/candle-studio/uploads/zysikdkdrcozt9v9ey2b.jpg';}} /></picture><div className="home-hero-note"><span className="home-eyebrow text-[9px]">The everyday, illuminated</span><p className="mt-2 font-serif text-2xl italic text-[#514335]">Stay a little longer.</p></div><span className="absolute right-5 top-5 bg-[#fcf9f2]/85 px-3 py-2 text-[9px] uppercase tracking-[.25em] text-[#58452f]">Candle Studio</span></div>
  </article>;
}
