import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { authApi } from '../api/authApi.js';
import { resetPasswordSchema } from '../schemas/authSchemas.js';
import { PasswordInput } from './PasswordInput.jsx';

export function ResetPasswordForm() {
  const [params] = useSearchParams();
  const [message, setMessage] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token: params.get('token') || '' },
  });
  async function onSubmit(values) {
    const { confirmPassword, ...payload } = values;
    const response = await authApi.resetPassword(payload);
    setMessage(response.message);
  }
  return (
    <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
      <label className="grid gap-1 text-sm font-medium text-stone-700">Reset token<input className="input" {...register('token')} />{errors.token && <span className="text-xs text-red-700">{errors.token.message}</span>}</label>
      <PasswordInput label="New password" {...register('password')} error={errors.password?.message} />
      <PasswordInput label="Confirm password" {...register('confirmPassword')} error={errors.confirmPassword?.message} />
      <button className="btn-primary" disabled={isSubmitting}>{isSubmitting ? 'Resetting...' : 'Reset password'}</button>
      {message && <p className="text-sm text-green-700">{message}</p>}
    </form>
  );
}
