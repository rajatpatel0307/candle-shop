import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CustomerPageHeading } from '../../../shared/components/CustomerUi.jsx';
import { authApi } from '../api/authApi.js';

function formatUserAgent(userAgent) {
  if (!userAgent) return 'Unknown device';

  const browser = userAgent.includes('Edg/')
    ? 'Microsoft Edge'
    : userAgent.includes('Chrome/')
      ? 'Chrome'
      : userAgent.includes('Firefox/')
        ? 'Firefox'
        : userAgent.includes('Safari/')
          ? 'Safari'
          : 'Browser';

  const platform = userAgent.includes('Windows')
    ? 'Windows'
    : userAgent.includes('Mac OS X')
      ? 'macOS'
      : userAgent.includes('Android')
        ? 'Android'
        : userAgent.includes('iPhone') || userAgent.includes('iPad')
          ? 'iOS'
          : 'Device';

  return `${browser} on ${platform}`;
}

function formatIp(ip) {
  if (!ip) return 'Unknown IP';
  if (ip === '::1' || ip === '127.0.0.1') return 'This device';
  return ip;
}

function formatDate(value) {
  if (!value) return null;
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function SessionManagementPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({ queryKey: ['auth-sessions'], queryFn: authApi.sessions });
  const revoke = useMutation({
    mutationFn: authApi.revokeSession,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['auth-sessions'] }),
  });
  const sessions = data?.data?.sessions || [];

  return (
    <main><CustomerPageHeading eyebrow="A little peace of mind" title="Account security" description="See where you are signed in and end any sessions you no longer need."/>
      {isLoading && <p className="text-sm text-stone-600">Loading sessions...</p>}
      {isError && <p role="alert" className="text-sm text-red-700">Could not load sessions.</p>}{revoke.isError && <p role="alert" className="mb-4 text-sm text-red-700">Could not end this session. Please try again.</p>}
      <div className="grid gap-3">
        {sessions.map((session) => {
          const isActive = Boolean(Number(session.IsActive));
          const createdAt = formatDate(session.CreatedAtUtc);
          const expiresAt = formatDate(session.ExpiresAtUtc);

          return (
            <div key={session.SessionId} className="rounded-md border border-stone-200 p-4 text-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{formatUserAgent(session.UserAgent)}</p>
                  <p className="mt-1 text-stone-600">
                    {formatIp(session.CreatedByIp)} - {isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${isActive ? 'bg-green-100 text-green-800' : 'bg-stone-100 text-stone-600'}`}>
                  {isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="mt-3 grid gap-1 text-xs text-stone-500">
                {createdAt && <p>Signed in {createdAt}</p>}
                {expiresAt && <p>Expires {expiresAt}</p>}
              </div>
              {isActive ? (
                <button
                  className="mt-3 text-sm font-semibold text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={revoke.isPending}
                  onClick={() => revoke.mutate(session.SessionId)}
                >
                  Revoke
                </button>
              ) : null}
            </div>
          );
        })}
        {!isLoading && sessions.length === 0 && <p className="text-sm text-stone-600">No sessions found.</p>}
      </div>
    </main>
  );
}
