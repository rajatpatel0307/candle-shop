import { useMutation } from '@tanstack/react-query';
import { CheckCircle2 } from 'lucide-react';
import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authApi } from '../api/authApi.js';

export function VerifyEmail() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const mutation = useMutation({ mutationFn: () => authApi.verifyEmail(token) });
  useEffect(() => {
    if (token) mutation.mutate();
  }, [token]);

  if (!token) return <p className="text-sm text-red-700">Verification token is missing.</p>;
  if (mutation.isPending) return <p className="text-sm text-stone-600">Verifying email...</p>;
  if (mutation.isError) return <p className="text-sm text-red-700">Verification failed. The link may be invalid or expired.</p>;
  return (
    <div className="grid gap-4 text-sm text-stone-700">
      <CheckCircle2 className="h-10 w-10 text-green-700" />
      <p>Your email has been verified.</p>
      <Link className="btn-primary w-fit" to="/account">Continue</Link>
    </div>
  );
}
