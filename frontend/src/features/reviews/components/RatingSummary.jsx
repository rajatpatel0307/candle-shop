import { Star } from 'lucide-react';

export function RatingSummary({ summary, onRatingSelect, activeRating }) {
  const count = Number(summary?.ReviewCount || 0);
  return <div className="flex flex-wrap items-center gap-8 rounded-xl bg-[#faf7f2] p-5 sm:p-6">
    <div className="min-w-24 text-center"><p className="flex items-center justify-center gap-2 text-4xl font-semibold">{count ? Number(summary.AverageRating).toFixed(1) : '-'}<Star className="h-6 w-6 fill-[#7c8d62] text-[#7c8d62]" /></p><p className="mt-2 text-xs text-stone-500">{count} {count === 1 ? 'review' : 'reviews'}</p><p className="mt-1 text-[10px] text-stone-400">Customer ratings</p></div>
    <div className="min-w-40 flex-1 space-y-2">{[5,4,3,2,1].map((rating) => { const total = Number(summary?.distribution?.find((row) => Number(row.Rating) === rating)?.Count || 0);return <button key={rating} type="button" disabled={!onRatingSelect || !total} aria-pressed={Number(activeRating) === rating} onClick={() => onRatingSelect?.(Number(activeRating) === rating ? undefined : rating)} className={`flex w-full items-center gap-3 rounded text-xs disabled:cursor-default ${Number(activeRating) === rating ? 'font-bold text-[#8d5132]' : 'text-stone-500'}`}><span className="flex w-6 items-center gap-1">{rating}<Star className="h-2.5 w-2.5 fill-current" /></span><span className="h-1.5 flex-1 overflow-hidden rounded-full bg-stone-200"><span className={`block h-full rounded-full ${rating >= 4 ? 'bg-[#829268]' : rating === 3 ? 'bg-[#d0a455]' : 'bg-[#c7826b]'}`} style={{width:`${count ? total/count*100 : 0}%`}} /></span><span className="w-6 text-right text-stone-400">{total}</span></button>; })}</div>
  </div>;
}
