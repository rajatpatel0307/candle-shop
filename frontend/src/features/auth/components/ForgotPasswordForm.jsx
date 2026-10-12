import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { authApi } from '../api/authApi.js';
import { forgotPasswordSchema } from '../schemas/authSchemas.js';

export function ForgotPasswordForm() {
  const [message, setMessage] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(forgotPasswordSchema) });
  async function onSubmit(values) {
    const response = await authApi.forgotPassword(values.email);
    setMessage(response.message);
  }
  return (
    <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
      <label className="grid gap-1 text-sm font-medium text-stone-700">Email<input className="input" {...register('email')} />{errors.email && <span className="text-xs text-red-700">{errors.email.message}</span>}</label>
      <button className="btn-primary" disabled={isSubmitting}>{isSubmitting ? 'Sending...' : 'Send reset link'}</button>
      {message && <p className="text-sm text-green-700">{message}</p>}
    </form>
  );
}
