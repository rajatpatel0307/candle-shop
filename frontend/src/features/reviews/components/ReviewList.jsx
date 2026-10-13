import { EmptyState } from '../../../shared/components/EmptyState.jsx';
import { ReviewCard } from './ReviewCard.jsx';
export function ReviewList({ reviews = [] }) { if (!reviews.length) return <EmptyState title="No reviews yet." />; return <div className="grid gap-3">{reviews.map((r) => <ReviewCard key={r.ProductReviewId} review={r} />)}</div>; }
