import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../services/apiClient.js';
import { ReviewTable } from '../components/ReviewTable.jsx';
import { ReviewModerationModal } from '../components/ReviewModerationModal.jsx';
import { AdminPageHeader, AdminPagination, AdminQueryState, AdminMutationFeedback } from '../../shared/AdminUi.jsx';
export function ManageReviews() {
  const qc = useQueryClient();
  const [selected,setSelected] = useState(null);
  const [filters,setFilters] = useState({page:1,status:'',sort:'newest'});
  const q = useQuery({queryKey:['admin-reviews',filters],queryFn:async () => (await apiClient.get('/admin/reviews',{params:{...filters,status:filters.status || undefined,limit:20}})).data.data.reviews});
  const mod = useMutation({mutationFn:({id,status,reason}) => apiClient.patch(`/admin/reviews/${id}/moderation`,{status,reason}),onSuccess:() => {setSelected(null);for(const key of ['admin-reviews','review-summary','product-reviews','review-eligibility','order','my-reviews']) qc.invalidateQueries({queryKey:[key]});}});
  const rows = q.data?.items || [];
  return <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6"><AdminPageHeader title="Customer reviews" description="Reviews publish immediately. Hide inappropriate content or restore a review when needed." /><section className="admin-panel mb-5 flex gap-3"><select aria-label="Review visibility" className="input max-w-xs" value={filters.status} onChange={(event) => setFilters({...filters,status:event.target.value,page:1})}><option value="">All reviews</option><option value="APPROVED">Published</option><option value="HIDDEN">Hidden</option><option value="REJECTED">Removed</option></select><select aria-label="Sort reviews" className="input max-w-xs" value={filters.sort} onChange={(event) => setFilters({...filters,sort:event.target.value,page:1})}><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="highest">Highest rating</option><option value="lowest">Lowest rating</option></select></section><AdminMutationFeedback mutations={[mod]} /><AdminQueryState query={q} empty={!rows.length} emptyText="No reviews match your filters." />{!q.isPending && !q.isError && rows.length > 0 && <><ReviewTable rows={rows} pending={mod.isPending} onSelect={setSelected} onModerate={(id,status) => mod.mutate({id,status})} /><AdminPagination page={filters.page} limit={20} total={q.data.pagination.total} onPage={(page) => setFilters({...filters,page})} /></>}<ReviewModerationModal key={selected?.ProductReviewId || 'closed'} review={selected} pending={mod.isPending} onClose={() => setSelected(null)} onModerate={(id,status,reason) => mod.mutate({id,status,reason})} /></main>;
}
