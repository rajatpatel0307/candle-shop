import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi.js';
import { useAuth } from '../hooks/useAuth.js';
import { loginSchema } from '../schemas/authSchemas.js';
import { getPostAuthPath } from '../utils/authRouting.js';
import { PasswordInput } from './PasswordInput.jsx';

export function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, status, error, errorCode } = useAuth();
  const [resendStatus, setResendStatus] = useState('');
  const [lastLoginEmail, setLastLoginEmail] = useState('');
  const { register, handleSubmit, getValues, formState: { errors } } = useForm({ resolver: zodResolver(loginSchema) });
  const needsVerification = errorCode === 'EMAIL_VERIFICATION_REQUIRED';

  async function onSubmit(values) {
    setResendStatus('');
    setLastLoginEmail(values.email);
    try {
      const user = await login(values);
      navigate(getPostAuthPath(user, location.state?.from), { replace: true });
    } catch {
      // Error text is shown from auth state.
    }
  }

  async function handleSendOtp() {
    const email = (getValues('email') || lastLoginEmail).trim();
    if (!email) {
      setResendStatus('Enter your email first.');
      return;
    }
    setResendStatus('Sending OTP...');
    try {
      await authApi.resendVerification(email);
      navigate(`/verify-email?email=${encodeURIComponent(email)}`, { replace: true });
    } catch {
      setResendStatus('Could not send OTP right now.');
    }
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
      <label className="grid gap-1 text-sm font-medium text-stone-700">Email
        <input className="input" autoComplete="email" {...register('email')} />
        {errors.email && <span className="text-xs text-red-700">{errors.email.message}</span>}
      </label>
      <PasswordInput label="Password" autoComplete="current-password" {...register('password')} error={errors.password?.message} />
      {error && <p className="text-sm text-red-700">{error}</p>}
      {needsVerification && (
        <button className="w-fit text-left text-sm font-semibold text-[#8d5132] underline" type="button" onClick={handleSendOtp}>
          Send OTP to verify email
        </button>
      )}
      {resendStatus && <p className="text-sm text-stone-600">{resendStatus}</p>}
      <button className="btn-primary" disabled={status === 'loading'}>{status === 'loading' ? 'Signing in...' : 'Sign in'}</button>
      <div className="flex justify-between text-sm">
        <Link className="text-[#8d5132] underline" to="/forgot-password">Forgot password</Link>
        <Link className="text-[#8d5132] underline" to="/register">Create account</Link>
      </div>
    </form>
  );
}
