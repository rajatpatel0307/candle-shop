import { useQuery } from '@tanstack/react-query';
import { reviewsApi } from '../reviews.api.js';
import { ReviewList } from '../components/ReviewList.jsx';
export function MyReviews() { const q = useQuery({ queryKey: ['my-reviews'], queryFn: async () => (await reviewsApi.mine()).data.data.reviews.items }); return <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6"><h1 className="text-4xl font-semibold">My reviews</h1><div className="mt-6"><ReviewList reviews={q.data || []} /></div></main>; }
