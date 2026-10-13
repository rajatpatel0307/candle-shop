import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout.jsx';
import { LoginForm } from '../components/LoginForm.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { getRoleHomePath } from '../utils/authRouting.js';

export function LoginPage() {
  const { user, status, loadCurrentUser } = useAuth();

  useEffect(() => {
    if (status === 'idle') loadCurrentUser();
  }, [status]);

  if (status === 'idle' || status === 'loading') return <div className="p-8 text-stone-600">Checking session...</div>;
  if (user) return <Navigate to={getRoleHomePath(user)} replace />;

  return <AuthLayout title="Welcome back" subtitle="Sign in to manage orders, wishlist, and checkout faster."><LoginForm /></AuthLayout>;
}
