import { reviewStatusLabel } from '../reviews.utils.js';
import { useState } from 'react';
import { PencilLine } from 'lucide-react';
import { ReviewComposer } from './ReviewComposer.jsx';
import { StarRating } from '../../../shared/components/StarRating.jsx';

export function OrderItemReview({ item, order }) {
  const [open,setOpen] = useState(false);
  const [saved,setSaved] = useState(false);
  if (!item.ProductId) return null;
  const delivered = order?.OrderStatus?.toUpperCase() === 'DELIVERED';
  const review = item.MyReviewId ? {ProductReviewId:item.MyReviewId,Rating:item.MyRating,ReviewTitle:item.MyReviewTitle,ReviewText:item.MyReviewText} : null;
  return <div className="mt-4 border-t border-stone-100 pt-4" id={`review-${item.OrderItemId}`}>
    {review && <div className="mb-3 flex flex-wrap items-center gap-3"><StarRating value={Number(item.MyRating)} /><span className="text-xs text-stone-400">{reviewStatusLabel(item.MyReviewStatus)}</span></div>}
    {delivered || review ? <button className="inline-flex items-center gap-2 text-xs font-semibold text-[#8d5132]" onClick={() => {setOpen(!open);setSaved(false);}}><PencilLine className="h-3.5 w-3.5" />{review ? 'Edit your review' : 'Rate & review product'}</button> : <p className="text-xs text-stone-400">{order?.OrderStatus === 'CANCELLED' ? 'Reviews are available for delivered purchases.' : 'Rate this product once your order is delivered.'}</p>}
    {open && <div className="mt-4"><ReviewComposer productId={item.ProductId} orderItemId={item.OrderItemId} review={review} onCancel={() => setOpen(false)} onSuccess={() => {setOpen(false);setSaved(true);}} /></div>}
    {saved && <p role="status" className="mt-3 text-xs text-green-700">Your review is now published.</p>}
  </div>;
}
