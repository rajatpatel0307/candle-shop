import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { UserRound, ShieldCheck, Check, ArrowUpRight, LockKeyhole, Monitor, Save, Mail } from 'lucide-react';
import { useAuth } from '../auth/hooks/useAuth.js';
import { setCurrentUser } from '../auth/store/authSlice.js';
import { accountApi } from './accountApi.js';

function ProfileForm({ user, pending, onSave, onEdit }) {
  const initial = { firstName: user.firstName || '', lastName: user.lastName || '', phoneNumber: user.phoneNumber || '' };
  const [form, setForm] = useState(initial);
  const dirty = Object.keys(initial).some((key) => form[key] !== initial[key]);
  return <form onSubmit={(event) => { event.preventDefault(); onSave(form); }}>
    <div className="grid items-start gap-x-6 gap-y-5 sm:grid-cols-2">
      {['firstName', 'lastName', 'phoneNumber'].map((name) => <label key={name} className="flex flex-col gap-2 text-sm font-medium text-stone-700">
        {name === 'firstName' ? 'First name' : name === 'lastName' ? 'Last name' : 'Mobile number'}
        <input className="account-input" value={form[name]} onChange={(event) => { setForm({ ...form, [name]: event.target.value }); onEdit(); }} required={name === 'firstName'} minLength={name === 'firstName' ? 2 : undefined} maxLength={name === 'phoneNumber' ? 10 : 100} type={name === 'phoneNumber' ? 'tel' : 'text'} inputMode={name === 'phoneNumber' ? 'numeric' : undefined} autoComplete={name === 'firstName' ? 'given-name' : name === 'lastName' ? 'family-name' : 'tel'} pattern={name === 'phoneNumber' ? '[6-9][0-9]{9}' : undefined} />
        {name === 'phoneNumber' && <span className="text-xs font-normal text-stone-400">For updates about your deliveries.</span>}
      </label>)}
      <label className="flex flex-col gap-2 text-sm font-medium text-stone-700">Email address
        <div className="relative"><Mail className="absolute left-3.5 top-4 h-4 w-4 text-stone-400" /><input className="account-input pl-10 read-only:bg-stone-50 read-only:text-stone-500" value={user.email || ''} readOnly /></div>
        <span className={`flex items-center gap-1.5 text-xs font-normal ${user.isEmailVerified ? 'text-green-700' : 'text-amber-700'}`}>{user.isEmailVerified && <Check className="h-3 w-3" />}{user.isEmailVerified ? 'Email verified' : 'Email verification pending'}</span>
      </label>
    </div>
    <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-stone-100 pt-5">
      <p className="text-xs text-stone-400">{dirty ? 'You have unsaved changes.' : 'Your details are up to date.'}</p>
      <div className="flex gap-3">{dirty && <button type="button" className="btn-secondary" disabled={pending} onClick={() => { setForm(initial); onEdit(); }}>Discard</button>}<button type="submit" className="btn-primary" disabled={pending || !dirty}><Save className="h-4 w-4" />{pending ? 'Saving...' : 'Save changes'}</button></div>
    </div>
  </form>;
}

export function ProfilePage() {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const client = useQueryClient();
  const queryKey = ['account-profile', user?.id];
  const query = useQuery({ queryKey, queryFn: async () => (await accountApi.profile()).data.data.user });
  const save = useMutation({ mutationFn: accountApi.saveProfile, onSuccess: (response) => {
    const updated = response.data.data.user;
    dispatch(setCurrentUser(updated));
    client.setQueryData(queryKey, updated);
  } });
  const profile = query.data || user;
  return <main className="space-y-6">
    <div><p className="account-eyebrow">A little about you</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">My profile</h1><p className="mt-2 text-sm text-stone-500">Your details, all in one place.</p></div>
    <section className="relative overflow-hidden rounded-2xl border border-[#e8ddcf] bg-[#eee4d6] p-6 sm:p-7">
      <div aria-hidden="true" className="absolute -right-12 -top-20 h-64 w-64 rounded-full border-[35px] border-white/30" />
      <div className="relative flex flex-wrap items-center gap-4"><span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/70 bg-white/70 text-2xl font-semibold text-[#8d5132]">{`${profile?.firstName?.[0] || 'C'}${profile?.lastName?.[0] || ''}`.toUpperCase()}</span><div className="min-w-0 flex-1"><h2 className="text-xl font-semibold">{[profile?.firstName, profile?.lastName].filter(Boolean).join(' ') || 'Your account'}</h2><p className="mt-1 break-all text-sm text-[#817061]">{profile?.email}</p></div>{profile?.isEmailVerified && <span className="inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-white/70 px-3 py-1.5 text-xs font-medium text-[#596b4b]"><ShieldCheck className="h-3.5 w-3.5" />Verified account</span>}</div>
    </section>
    <section className="account-panel">
      <div className="mb-6 flex items-start gap-3"><span className="account-icon"><UserRound className="h-5 w-5" /></span><div><h2 className="text-lg font-semibold">Personal information</h2><p className="mt-1 text-xs text-stone-500">Make sure we have the right details for your next order.</p></div></div>
      {query.isPending && <div className="grid gap-4 sm:grid-cols-2">{[1,2,3,4].map((item) => <div key={item} className="h-16 rounded-lg bg-stone-100 motion-safe:animate-pulse" />)}</div>}
      {query.isError && <p role="alert" className="text-sm text-red-700">Could not load your profile. <button className="underline" onClick={() => query.refetch()}>Try again</button></p>}
      {query.data && <ProfileForm key={query.data.id} user={query.data} pending={save.isPending} onSave={(payload) => save.mutate(payload)} onEdit={() => { if (!save.isPending) save.reset(); }} />}
      {save.isError && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{save.error?.response?.data?.error?.message || 'Could not save your profile.'}</p>}
      {save.isSuccess && <p role="status" className="mt-4 flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700"><Check className="h-4 w-4" />Your profile has been saved.</p>}
    </section>
    <section><div className="mb-4 flex items-center gap-2"><LockKeyhole className="h-4 w-4 text-stone-400" /><h2 className="text-sm font-semibold">Account security</h2></div><div className="grid gap-4 sm:grid-cols-2">
      {[[Monitor, 'Active sessions', 'See where you are signed in.', '/sessions'], [ShieldCheck, 'Reset password', 'Keep your account protected.', '/forgot-password']].map(([Icon, title, description, to]) => <Link key={to} to={to} className="group flex items-center gap-4 rounded-xl border border-stone-200 bg-white p-5 transition hover:border-[#c9aa8d] hover:shadow-sm"><span className="account-icon"><Icon className="h-5 w-5" /></span><span className="flex-1"><span className="block text-sm font-semibold">{title}</span><span className="mt-1 block text-xs text-stone-500">{description}</span></span><ArrowUpRight className="h-4 w-4 text-stone-400 group-hover:text-[#8d5132]" /></Link>)}
    </div></section>
  </main>;
}
