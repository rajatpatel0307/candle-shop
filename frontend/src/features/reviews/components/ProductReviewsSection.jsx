import { reviewStatusLabel } from '../reviews.utils.js';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MessageSquare, PencilLine } from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth.js';
import { reviewsApi } from '../reviews.api.js';
import { RatingSummary } from './RatingSummary.jsx';
import { ReviewCard } from './ReviewCard.jsx';
import { ReviewComposer } from './ReviewComposer.jsx';

export function ProductReviewsSection({ productId }) {
  const { user } = useAuth();
  const [filters,setFilters] = useState({ sort:'newest',page:1,limit:5 });
  const [writing,setWriting] = useState(false);
  const [submitted,setSubmitted] = useState(false);
  const summary = useQuery({ queryKey:['review-summary',productId], queryFn:async () => (await reviewsApi.summary(productId)).data.data.summary });
  const reviews = useQuery({ queryKey:['product-reviews',productId,filters], queryFn:async () => (await reviewsApi.list(productId,filters)).data.data.reviews });
  const eligibility = useQuery({ queryKey:['review-eligibility',productId,user?.id], enabled:Boolean(user), queryFn:async () => (await reviewsApi.eligibility(productId)).data.data.eligibility });
  const pages = Math.max(1,Math.ceil((reviews.data?.pagination?.total || 0)/filters.limit));
  return <section id="reviews" className="scroll-mt-24 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-8">
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4"><div><p className="account-eyebrow">From our customers</p><h2 className="mt-2 text-2xl font-semibold">Ratings & reviews</h2></div>{user ? <button className="btn-secondary" disabled={eligibility.isPending || !eligibility.data?.canReview} onClick={() => {setWriting(!writing);setSubmitted(false);}}><PencilLine className="h-4 w-4" />{eligibility.data?.review ? 'Edit your review' : 'Rate this product'}</button> : <Link className="btn-secondary" to="/login">Sign in to review</Link>}</div>
    {summary.isError ? <p className="mb-4 text-sm text-red-700" role="alert">Could not load ratings. <button className="underline" onClick={() => summary.refetch()}>Try again</button></p> : summary.isPending ? <p className="py-6 text-sm text-stone-500">Loading ratings...</p> : <RatingSummary summary={summary.data} activeRating={filters.rating} onRatingSelect={(rating) => setFilters({...filters,rating,page:1})} />}
    {user && eligibility.data && !eligibility.data.canReview && <p className="mt-4 text-xs text-stone-500">{eligibility.data.message}</p>}
    {eligibility.isError && <p role="alert" className="mt-4 text-xs text-red-700">Could not check review eligibility. <button className="underline" onClick={() => eligibility.refetch()}>Try again</button></p>}
    {eligibility.data?.review && !writing && <p className="mt-4 rounded-lg bg-stone-50 p-3 text-xs text-stone-600">Your rating: {eligibility.data.review.Rating}/5. {`Review status: ${reviewStatusLabel(eligibility.data.review.ReviewStatus)}.`}</p>}
    {writing && eligibility.data?.canReview && <div className="mt-5"><ReviewComposer productId={productId} orderItemId={eligibility.data.orderItemId} review={eligibility.data.review} onCancel={() => setWriting(false)} onSuccess={() => {setWriting(false);setSubmitted(true);}} /></div>}
    {submitted && <p role="status" className="mt-5 rounded-lg bg-green-50 p-4 text-sm text-green-700">Thank you! Your review is now published.</p>}
    <div className="mb-5 mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-5"><div className="flex items-center gap-3 text-sm text-stone-500">{reviews.data?.pagination?.total || 0} reviews{filters.rating && <button className="rounded-full bg-stone-100 px-3 py-1 text-xs" onClick={() => setFilters({...filters,rating:undefined,page:1})}>{filters.rating} stars ×</button>}</div><select aria-label="Sort reviews" className="input w-auto" value={filters.sort} onChange={(e) => setFilters({...filters,sort:e.target.value,page:1})}>{[['newest','Most recent'],['oldest','Oldest first'],['highest','Highest rating'],['lowest','Lowest rating']].map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></div>
    {reviews.isPending && <p className="text-sm text-stone-500">Loading reviews...</p>}
    {reviews.isError && <p role="alert" className="text-sm text-red-700">Could not load reviews. <button className="underline" onClick={() => reviews.refetch()}>Try again</button></p>}
    <div className="grid gap-4">{reviews.data?.items.map((review) => <ReviewCard key={review.ProductReviewId} review={review} />)}</div>
    {reviews.isSuccess && !reviews.data.items.length && <div className="py-10 text-center text-stone-400"><MessageSquare className="mx-auto mb-3 h-8 w-8" strokeWidth={1.3} /><p className="text-sm">{filters.rating ? 'No reviews match this rating.' : 'No published reviews yet. Delivered your candle? Share your experience.'}</p></div>}
    {pages>1 && <div className="mt-5 flex items-center justify-between gap-3 text-xs text-stone-500"><span>Page {filters.page} of {pages}</span><div className="flex gap-2"><button className="btn-secondary" disabled={reviews.isFetching || filters.page<=1} onClick={() => setFilters({...filters,page:filters.page-1})}>Previous</button><button className="btn-secondary" disabled={reviews.isFetching || filters.page>=pages} onClick={() => setFilters({...filters,page:filters.page+1})}>Next</button></div></div>}
  </section>;
}
