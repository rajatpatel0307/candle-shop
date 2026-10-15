import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PencilLine, Trash2, Star } from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth.js';
import { reviewsApi } from '../reviews.api.js';
import { ReviewCard } from '../components/ReviewCard.jsx';
import { ReviewComposer } from '../components/ReviewComposer.jsx';

export function MyReviews() {
  const {user} = useAuth();
  const client = useQueryClient();
  const [page,setPage] = useState(1);
  const [editing,setEditing] = useState(null);
  const [deleting,setDeleting] = useState(null);
  const [notice,setNotice] = useState('');
  const query = useQuery({queryKey:['my-reviews',user?.id,page],queryFn:async () => (await reviewsApi.mine({page,limit:10})).data.data.reviews});
  const remove = useMutation({mutationFn:reviewsApi.remove,onSuccess:() => {setDeleting(null);setNotice('Review removed.');for(const key of ['my-reviews','review-summary','product-reviews','review-eligibility','order'])client.invalidateQueries({queryKey:[key]});}});
  const pages = Math.max(1,Math.ceil((query.data?.pagination?.total || 0)/10));
  return <main className="space-y-6"><div><p className="account-eyebrow">Your experience matters</p><h1 className="mt-2 text-3xl font-semibold">My reviews</h1><p className="mt-2 text-sm text-stone-500">Manage your ratings and help other customers choose.</p></div>
    {notice && <p role="status" className="rounded-lg bg-green-50 p-3 text-sm text-green-700">{notice}</p>}
    {query.isPending && <p className="text-sm text-stone-500">Loading your reviews...</p>}
    {(query.isError || remove.isError) && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{(remove.error || query.error)?.response?.data?.error?.message || 'Could not load or update your reviews.'}{query.isError && <button className="ml-3 underline" onClick={() => query.refetch()}>Try again</button>}</p>}
    {query.isSuccess && !query.data.items.length && <section className="account-panel py-12 text-center"><Star className="mx-auto h-10 w-10 text-[#b58b62]" /><h2 className="mt-4 text-lg font-semibold">Your first review starts with a purchase</h2><p className="mt-2 text-sm text-stone-500">Open a delivered order to share your experience.</p><Link className="btn-primary mt-5" to="/orders">View my orders</Link></section>}
    {query.data?.items.map((review) => <section key={review.ProductReviewId} className="space-y-3"><div className="flex flex-wrap items-center justify-between gap-3"><Link to={`/products/${review.ProductSlug}`} className="text-sm font-semibold text-[#8d5132]">{review.ProductName}</Link><div className="flex gap-4 text-xs"><button className="flex items-center gap-1 text-stone-500" onClick={() => setEditing(review.ProductReviewId)}><PencilLine className="h-3.5 w-3.5" />Edit</button><button className="flex items-center gap-1 text-stone-400 hover:text-red-700" onClick={() => setDeleting(review.ProductReviewId)}><Trash2 className="h-3.5 w-3.5" />Remove</button></div></div>{editing===review.ProductReviewId ? <ReviewComposer productId={review.ProductId} review={review} onCancel={() => setEditing(null)} onSuccess={() => {setEditing(null);setNotice('Your updated review is now published.');}} /> : <ReviewCard review={{...review,FirstName:user?.firstName,LastName:user?.lastName}} />}{deleting===review.ProductReviewId && <div className="rounded-lg bg-red-50 p-4 text-sm"><p>Remove this review?</p><div className="mt-3 flex gap-4"><button className="font-semibold text-red-700" disabled={remove.isPending} onClick={() => remove.mutate(review.ProductReviewId)}>{remove.isPending ? 'Removing...' : 'Remove review'}</button><button disabled={remove.isPending} onClick={() => setDeleting(null)}>Keep review</button></div></div>}</section>)}
    {pages>1 && <div className="flex items-center justify-between text-xs text-stone-500"><span>Page {page} of {pages}</span><div className="flex gap-3"><button className="btn-secondary" disabled={page<=1} onClick={() => setPage(page-1)}>Previous</button><button className="btn-secondary" disabled={page>=pages} onClick={() => setPage(page+1)}>Next</button></div></div>}
  </main>;
}
