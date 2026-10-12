import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AuthLayout } from '../components/AuthLayout.jsx';
import { authApi } from '../api/authApi.js';

export function SessionManagementPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({ queryKey: ['auth-sessions'], queryFn: authApi.sessions });
  const revoke = useMutation({
    mutationFn: authApi.revokeSession,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['auth-sessions'] }),
  });
  const sessions = data?.data?.sessions || [];

  return (
    <AuthLayout title="Active sessions" subtitle="Review and revoke signed-in devices.">
      {isLoading && <p className="text-sm text-stone-600">Loading sessions...</p>}
      {isError && <p className="text-sm text-red-700">Could not load sessions.</p>}
      <div className="grid gap-3">
        {sessions.map((session) => (
          <div key={session.SessionId} className="rounded-md border border-stone-200 p-3 text-sm">
            <p className="font-semibold">{session.UserAgent || 'Unknown device'}</p>
            <p className="text-stone-600">{session.CreatedByIp || 'Unknown IP'} · {session.IsActive ? 'Active' : 'Inactive'}</p>
            {session.IsActive && <button className="mt-3 text-sm font-semibold text-red-700" onClick={() => revoke.mutate(session.SessionId)}>Revoke</button>}
          </div>
        ))}
      </div>
    </AuthLayout>
  );
}
