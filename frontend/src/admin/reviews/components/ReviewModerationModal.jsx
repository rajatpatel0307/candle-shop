import { useState } from 'react';
import { StatusBadge } from '../../../shared/components/StatusBadge.jsx';

export function ReviewModerationModal({ review, pending = false, onClose, onModerate }) {
  const [reason, setReason] = useState('');

  if (!review) {
    return null;
  }

  const submit = (status) => {
    onModerate?.(review.ProductReviewId, status, reason.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <section className="w-full max-w-xl rounded-lg bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-stone-500">{review.ProductName}</p>
            <h2 className="mt-1 text-2xl font-semibold text-stone-900">Moderate review</h2>
          </div>
          <button className="text-sm font-semibold text-stone-500 hover:text-stone-900" type="button" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="mt-5 space-y-3 rounded-lg border border-stone-200 bg-stone-50 p-4 text-sm text-stone-700">
          <div className="flex items-center justify-between gap-3">
            <span>{review.Email}</span>
            <StatusBadge status={review.ReviewStatus} />
          </div>
          <p className="font-semibold text-stone-900">{review.Rating}/5 stars</p>
          <p>{review.ReviewText || 'No review text provided.'}</p>
        </div>

        <label className="mt-5 block text-sm font-semibold text-stone-700" htmlFor="review-moderation-reason">
          Moderation note
        </label>
        <textarea
          id="review-moderation-reason"
          className="mt-2 min-h-28 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-[#8d5132] focus:ring-2 focus:ring-[#8d5132]/20"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
        />

        <div className="mt-5 flex flex-wrap justify-end gap-3">
          <button className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700" type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 disabled:opacity-60" type="button" disabled={pending} onClick={() => submit('REJECTED')}>
            Reject
          </button>
          <button className="rounded-lg bg-[#8d5132] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60" type="button" disabled={pending} onClick={() => submit('APPROVED')}>
            Approve
          </button>
        </div>
      </section>
    </div>
  );
}
