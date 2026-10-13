import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout.jsx';
import { RegisterForm } from '../components/RegisterForm.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { getRoleHomePath } from '../utils/authRouting.js';

export function RegisterPage() {
  const { user, status, loadCurrentUser } = useAuth();

  useEffect(() => {
    if (status === 'idle') loadCurrentUser();
  }, [status]);

  if (status === 'idle' || status === 'loading') return <div className="p-8 text-stone-600">Checking session...</div>;
  if (user) return <Navigate to={getRoleHomePath(user)} replace />;

  return <AuthLayout title="Create account" subtitle="Join Candle Commerce for a quieter, warmer shopping experience."><RegisterForm /></AuthLayout>;
}
