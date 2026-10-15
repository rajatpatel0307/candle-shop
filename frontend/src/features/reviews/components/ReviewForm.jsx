import { useState } from 'react';
import { StarRating } from '../../../shared/components/StarRating.jsx';

export function ReviewForm({ onSubmit, pending, initialReview, onCancel }) {
  const [rating,setRating] = useState(Number(initialReview?.Rating || 0));
  const [title,setTitle] = useState(initialReview?.ReviewTitle || '');
  const [comment,setComment] = useState(initialReview?.ReviewText || '');
  return <form className="rounded-xl border border-[#dfcfba] bg-[#fcfaf6] p-5 sm:p-6" onSubmit={(event) => { event.preventDefault(); if(rating) onSubmit({rating,title:title.trim(),comment:comment.trim()}); }}>
    <h3 className="text-lg font-semibold">{initialReview ? 'Edit your review' : 'Rate & review this product'}</h3><p className="mt-1 text-xs text-stone-500">Tell other shoppers about the scent, quality, and your experience.</p>
    <fieldset disabled={pending} className="mt-5"><legend className="mb-2 text-xs font-semibold">Your rating</legend><StarRating value={rating} onChange={setRating} /><p className="mt-1 text-xs text-stone-500">{['Select a rating','Poor','Fair','Good','Very good','Excellent'][rating]}</p></fieldset>
    <label className="mt-5 grid gap-2 text-xs font-semibold">Review title (optional)<input className="account-input" value={title} disabled={pending} maxLength={150} onChange={(e) => setTitle(e.target.value)} placeholder="What stood out?" /></label>
    <label className="mt-4 grid gap-2 text-xs font-semibold">Your experience<textarea className="input min-h-32 leading-6" required minLength={10} maxLength={2000} disabled={pending} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Share an honest review of your purchase..." /></label><p className="mt-2 text-right text-[10px] text-stone-400">{comment.length}/2000 | Minimum 10 characters</p>
    <p className="mt-4 text-xs leading-5 text-stone-500">Your review will be published immediately.</p><div className="mt-5 flex flex-wrap gap-3"><button type="submit" className="btn-primary" disabled={pending || !rating || comment.trim().length<10}>{pending ? 'Submitting...' : initialReview ? 'Save review' : 'Submit review'}</button>{onCancel && <button type="button" className="btn-secondary" disabled={pending} onClick={onCancel}>Cancel</button>}</div>
  </form>;
}
