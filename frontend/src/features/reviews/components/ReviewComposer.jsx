import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewsApi } from '../reviews.api.js';
import { ReviewForm } from './ReviewForm.jsx';

export function ReviewComposer({ productId, orderItemId, review, onCancel, onSuccess }) {
  const client = useQueryClient();
  const save = useMutation({
    mutationFn: (payload) => review ? reviewsApi.update(review.ProductReviewId, payload) : reviewsApi.create(productId, { ...payload, ...(orderItemId ? { orderItemId: Number(orderItemId) } : {}) }),
    onSuccess: () => {
      for (const key of ['review-summary', 'product-reviews', 'review-eligibility', 'my-reviews', 'order', 'orders', 'admin-reviews']) client.invalidateQueries({ queryKey: [key] });
      onSuccess?.();
    },
  });
  return <div><ReviewForm initialReview={review} pending={save.isPending} onSubmit={(payload) => save.mutate(payload)} onCancel={onCancel} />{save.isError && <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{save.error?.response?.data?.error?.message || 'Could not save your review. Please try again.'}</p>}</div>;
}
