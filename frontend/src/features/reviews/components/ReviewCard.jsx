import { reviewStatusLabel } from '../reviews.utils.js';
import { ShieldCheck, Star } from 'lucide-react';

export function ReviewCard({ review }) {
  const name = [review.FirstName,review.LastName].filter(Boolean).join(' ') || 'Customer';
  return <article className="rounded-xl border border-stone-200 bg-white p-5">
    <div className="flex items-start gap-3"><span className={`flex shrink-0 items-center gap-1 rounded px-2 py-1 text-xs font-bold text-white ${review.Rating >= 4 ? 'bg-[#76885d]' : review.Rating === 3 ? 'bg-[#c49a4d]' : 'bg-[#bd7963]'}`}>{review.Rating}<Star className="h-3 w-3 fill-current" /></span><h3 className="pt-0.5 text-sm font-semibold">{review.ReviewTitle || review.ProductName || ['','Poor','Fair','Good','Very good','Excellent'][review.Rating]}</h3></div>
    <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-stone-600">{review.ReviewText}</p>
    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-stone-400"><span>{name}</span>{Boolean(review.IsVerifiedPurchase) && <span className="flex items-center gap-1 text-[#73845f]"><ShieldCheck className="h-3.5 w-3.5" />Verified purchase</span>}{review.CreatedAtUtc && <time dateTime={review.CreatedAtUtc}>{new Intl.DateTimeFormat('en-IN',{dateStyle:'medium'}).format(new Date(review.CreatedAtUtc))}</time>}{review.ReviewStatus && <span className="rounded bg-stone-100 px-2 py-1">{reviewStatusLabel(review.ReviewStatus)}</span>}</div>
  </article>;
}
