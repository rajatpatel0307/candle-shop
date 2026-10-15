import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Pause, Play } from 'lucide-react';
import { BannerSlide } from './BannerSlide.jsx';
import { eligibleItems } from '../home.utils.js';
export function BannerCarousel({ banners = [] }) {
  const slides=useMemo(() => eligibleItems(banners),[banners]);
  const [index,setIndex]=useState(0);
  const [hovered,setHovered]=useState(false);
  const [paused,setPaused]=useState(false);
  const count=slides.length;
  const current=count ? index % count : 0;
  useEffect(() => {
    if(count<=1 || paused || hovered || window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const timer=window.setInterval(() => setIndex((value) => (value+1)%count),6500);
    return () => window.clearInterval(timer);
  },[count,paused,hovered]);
  if(!count)return null;
  return <section aria-label="Discover Candle Studio" aria-roledescription="carousel" className="home-hero" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onFocusCapture={() => setHovered(true)} onBlurCapture={(event) => {if(!event.currentTarget.contains(event.relatedTarget))setHovered(false);}}>
    <div className="home-hero-stage">{slides.map((slide,i) => <BannerSlide key={slide.id || `${slide.title}-${i}`} slide={slide} index={i} active={i===current} />)}</div>
    {count>1 && <div className="home-hero-controls"><div className="flex items-center gap-3"><button className="home-round-button" aria-label="Previous banner" onClick={() => setIndex((current+count-1)%count)}><ArrowLeft className="h-4 w-4" /></button><span className="text-[11px] tabular-nums">{String(current+1).padStart(2,'0')} / {String(count).padStart(2,'0')}</span><button className="home-round-button" aria-label="Next banner" onClick={() => setIndex((current+1)%count)}><ArrowRight className="h-4 w-4" /></button></div><div className="flex gap-2">{slides.map((slide,i) => <button key={slide.id || i} aria-label={`Show banner ${i+1}`} aria-current={i===current ? 'true':undefined} onClick={() => setIndex(i)} className={`h-1 w-6 rounded-full ${i===current ? 'bg-[#815c3e]':'bg-[#d9cdbd]'}`} />)}</div><button className="home-round-button" aria-label={paused ? 'Play banners':'Pause banners'} aria-pressed={paused} onClick={() => setPaused(!paused)}>{paused ? <Play className="h-3.5 w-3.5" />:<Pause className="h-3.5 w-3.5" />}</button></div>}
  </section>;
}
