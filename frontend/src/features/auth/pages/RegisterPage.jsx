import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout.jsx';
import { RegisterForm } from '../components/RegisterForm.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { getRoleHomePath } from '../utils/authRouting.js';

export function RegisterPage() {
  const { user, status, loadCurrentUser } = useAuth();
  const [checkingSession,setCheckingSession]=useState(status==='idle' || status==='loading');

  useEffect(() => {
    if (status === 'idle') loadCurrentUser();
    else if(status!=='loading')setCheckingSession(false);
  }, [status]);

  if (checkingSession && (status === 'idle' || status === 'loading')) return <div className="p-8 text-stone-600">Checking session...</div>;
  if (user) return <Navigate to={getRoleHomePath(user)} replace />;

  return <AuthLayout title="Create account" subtitle="Make room for your favourites, thoughtful gifts, and a warmer kind of home."><RegisterForm /></AuthLayout>;
}
