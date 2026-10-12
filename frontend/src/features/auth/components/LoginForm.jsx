import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { loginSchema } from '../schemas/authSchemas.js';
import { PasswordInput } from './PasswordInput.jsx';

export function LoginForm() {
  const navigate = useNavigate();
  const { login, status, error } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values) {
    await login(values);
    navigate('/account');
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
      <label className="grid gap-1 text-sm font-medium text-stone-700">Email
        <input className="input" autoComplete="email" {...register('email')} />
        {errors.email && <span className="text-xs text-red-700">{errors.email.message}</span>}
      </label>
      <PasswordInput label="Password" autoComplete="current-password" {...register('password')} error={errors.password?.message} />
      {error && <p className="text-sm text-red-700">{error}</p>}
      <button className="btn-primary" disabled={status === 'loading'}>{status === 'loading' ? 'Signing in...' : 'Sign in'}</button>
      <div className="flex justify-between text-sm">
        <Link className="text-[#8d5132] underline" to="/forgot-password">Forgot password</Link>
        <Link className="text-[#8d5132] underline" to="/register">Create account</Link>
      </div>
    </form>
  );
}
