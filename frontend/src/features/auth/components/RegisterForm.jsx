import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { registerSchema } from '../schemas/authSchemas.js';
import { getRoleHomePath } from '../utils/authRouting.js';
import { passwordStrength } from '../utils/authHelpers.js';
import { PasswordInput } from './PasswordInput.jsx';

export function RegisterForm() {
  const navigate = useNavigate();
  const { register: createAccount, status, error } = useAuth();
  const { register, handleSubmit, watch, formState: { errors } } = useForm({ resolver: zodResolver(registerSchema) });
  const watchedPassword = watch('password') || '';
  const strength = passwordStrength(watchedPassword);

  async function onSubmit(values) {
    const { confirmPassword, ...payload } = values;
    const user = await createAccount(payload);
    navigate(getRoleHomePath(user), { replace: true });
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm font-medium text-stone-700">First name<input className="input" {...register('firstName')} />{errors.firstName && <span className="text-xs text-red-700">{errors.firstName.message}</span>}</label>
        <label className="grid gap-1 text-sm font-medium text-stone-700">Last name<input className="input" {...register('lastName')} /></label>
      </div>
      <label className="grid gap-1 text-sm font-medium text-stone-700">Email<input className="input" autoComplete="email" {...register('email')} />{errors.email && <span className="text-xs text-red-700">{errors.email.message}</span>}</label>
      <label className="grid gap-1 text-sm font-medium text-stone-700">Phone<input className="input" autoComplete="tel" {...register('phoneNumber')} /></label>
      <PasswordInput label="Password" autoComplete="new-password" {...register('password')} error={errors.password?.message} />
      {watchedPassword && <p className={`text-xs ${strength.tone}`}>Password strength: {strength.label}</p>}
      <PasswordInput label="Confirm password" autoComplete="new-password" {...register('confirmPassword')} error={errors.confirmPassword?.message} />
      {error && <p className="text-sm text-red-700">{error}</p>}
      <button className="btn-primary" disabled={status === 'loading'}>{status === 'loading' ? 'Creating...' : 'Create account'}</button>
      <p className="text-sm">Already have an account? <Link className="text-[#8d5132] underline" to="/login">Sign in</Link></p>
    </form>
  );
}
