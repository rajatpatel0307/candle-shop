import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

export function AuthGuard({ children }) {
  const location = useLocation();
  const { isAuthenticated, status, loadCurrentUser } = useAuth();
  useEffect(() => {
    if (status === 'idle') loadCurrentUser();
  }, [status]);
  if (status === 'idle' || status === 'loading') return <div className="p-8 text-stone-600">Checking session...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
  return children;
}
