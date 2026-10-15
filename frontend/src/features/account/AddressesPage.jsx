import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MapPin, Plus, Pencil, Trash2, Home, BriefcaseBusiness, Check, Phone, ShieldCheck } from 'lucide-react';
import { useAuth } from '../auth/hooks/useAuth.js';
import { DeliveryAddressForm } from '../checkout/components/DeliveryAddressForm.jsx';
import { accountApi } from './accountApi.js';

function formValues(address) {
  if (!address) return undefined;
  return {
    recipientName: address.RecipientName, phoneNumber: address.PhoneNumber, addressLine1: address.AddressLine1,
    addressLine2: address.AddressLine2 || '', locality: address.Locality || '', city: address.City,
    stateOrProvince: address.StateOrProvince || '', postalCode: address.PostalCode, countryCode: 'IN',
    addressLabel: address.AddressLabel?.toLowerCase() === 'work' ? 'Work' : 'Home',
    isDefaultShipping: Boolean(address.IsDefaultShipping), isDefaultBilling: Boolean(address.IsDefaultBilling),
  };
}

export function AddressesPage() {
  const { user } = useAuth();
  const client = useQueryClient();
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [notice, setNotice] = useState('');
  const queryKey = ['account-addresses', user?.id];
  const query = useQuery({ queryKey, queryFn: async () => (await accountApi.addresses()).data.data.addresses });
  const refresh = () => { client.invalidateQueries({ queryKey }); client.invalidateQueries({ queryKey: ['checkout'] }); };
  const save = useMutation({ mutationFn: accountApi.saveAddress, onSuccess: () => { refresh(); setShowForm(false); setEditing(null); setNotice('Address saved.'); } });
  const remove = useMutation({ mutationFn: accountApi.deleteAddress, onSuccess: () => { refresh(); setDeleting(null); setNotice('Address removed.'); } });
  const busy = save.isPending || remove.isPending;
  const error = save.error || remove.error;
  function openForm(address = null) { setEditing(address); setShowForm(true); setNotice(''); save.reset(); remove.reset(); }
  const total = query.data?.length || 0;
  return <main className="space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="account-eyebrow">Your favourite places</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">My addresses</h1><p className="mt-2 text-sm text-stone-500">A smooth delivery starts with the right address.</p></div><button type="button" className="btn-primary" disabled={busy} onClick={() => openForm()}><Plus className="h-4 w-4" />Add address</button></div>
    <div className="flex items-start gap-3 rounded-xl border border-[#e8ddcf] bg-[#f1e8db] p-4 text-xs leading-5 text-[#88715e]"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" /><p>Choose a default address for faster checkout. You can always select a different address when ordering.</p></div>
    {notice && <p role="status" className="flex items-center gap-2 rounded-lg bg-green-50 p-4 text-sm text-green-700"><Check className="h-4 w-4" />{notice}</p>}
    {error && <p role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error.response?.data?.error?.message || 'Could not update the address. Please try again.'}</p>}
    {showForm && <section className="account-panel"><DeliveryAddressForm key={editing?.AddressId || 'new'} initialValues={formValues(editing)} showDefaults pending={save.isPending} onCancel={() => { setShowForm(false); setEditing(null); }} onSave={(payload) => save.mutate({ id: editing?.AddressId, payload })} /></section>}
    {query.isPending && <div className="grid gap-4 sm:grid-cols-2">{[1,2].map((item) => <div key={item} className="h-60 rounded-2xl border border-stone-200 bg-white motion-safe:animate-pulse" />)}</div>}
    {query.isError && <p role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-700">Could not load your addresses. <button className="underline" onClick={() => query.refetch()}>Try again</button></p>}
    {query.isSuccess && total === 0 && !showForm && <section className="account-panel py-14 text-center"><span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#f7f2ea]"><MapPin className="h-9 w-9 text-[#b58c69]" strokeWidth={1.3} /></span><h2 className="mt-5 text-xl font-semibold">A place for your next delivery</h2><p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-stone-500">Save your home or work address and make your next checkout a little easier.</p><button className="btn-primary mt-6" onClick={() => openForm()}><Plus className="h-4 w-4" />Add your first address</button></section>}
    {total > 0 && <p className="text-xs text-stone-400">{total} saved {total === 1 ? 'address' : 'addresses'}</p>}
    <div className="grid gap-5 sm:grid-cols-2">
      {query.data?.map((address) => {
        const WorkIcon = address.AddressLabel?.toLowerCase() === 'work' ? BriefcaseBusiness : Home;
        return <article key={address.AddressId} className={`flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm ${address.IsDefaultShipping ? 'border-[#c8ac8d]' : 'border-stone-200'}`}>
          <div className="flex items-center justify-between gap-3 border-b border-stone-100 px-5 py-4"><div className="flex items-center gap-2.5"><span className="account-icon h-9 w-9"><WorkIcon className="h-4 w-4" /></span><span className="text-sm font-semibold">{address.AddressLabel || 'Home'}</span></div>{Boolean(address.IsDefaultShipping) && <span className="flex items-center gap-1 rounded-full bg-[#f4ede2] px-2.5 py-1 text-[10px] font-semibold text-[#8d6843]"><Check className="h-3 w-3" />Default delivery</span>}</div>
          <div className="flex-1 p-5"><h2 className="font-semibold">{address.RecipientName}</h2><p className="mt-3 text-sm leading-7 text-stone-500">{address.AddressLine1}{address.AddressLine2 && <>, {address.AddressLine2}</>}{address.Locality && <>, {address.Locality}</>}<br />{address.City}, {address.StateOrProvince}<br /><span className="font-medium text-stone-700">{address.PostalCode}</span></p><p className="mt-4 flex items-center gap-2 text-xs text-stone-500"><Phone className="h-3.5 w-3.5" />{address.PhoneNumber}</p>{Boolean(address.IsDefaultBilling) && <p className="mt-3 text-[10px] font-medium uppercase tracking-wider text-stone-400">Also your default billing address</p>}</div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 px-5 py-4"><div className="flex gap-4 text-xs font-semibold"><button className="flex items-center gap-1.5 text-[#8d5132]" disabled={busy} onClick={() => openForm(address)}><Pencil className="h-3.5 w-3.5" />Edit</button><button className="flex items-center gap-1.5 text-stone-400 hover:text-red-700" disabled={busy} onClick={() => { setDeleting(address.AddressId); remove.reset(); }}><Trash2 className="h-3.5 w-3.5" />Remove</button></div>{!address.IsDefaultShipping && <button type="button" disabled={busy || showForm} className="text-[11px] font-medium text-[#8d5132] disabled:opacity-40" onClick={() => { setNotice(''); save.mutate({ id: address.AddressId, payload: { ...formValues(address), isDefaultShipping: true } }); }}>Set as default</button>}</div>
          {deleting === address.AddressId && <div className="border-t border-red-100 bg-red-50 p-4 text-xs leading-5"><p>Remove this saved address? Previous orders keep their delivery details.</p><div className="mt-3 flex gap-4"><button className="font-semibold text-red-700" disabled={busy} onClick={() => remove.mutate(address.AddressId)}>{remove.isPending ? 'Removing...' : 'Remove address'}</button><button disabled={busy} onClick={() => setDeleting(null)}>Keep address</button></div></div>}
        </article>;
      })}
      {total > 0 && <button type="button" disabled={busy} onClick={() => openForm()} className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-stone-200 bg-white/30 p-8 text-stone-400 transition hover:border-[#c8ac8d] hover:bg-white/60 hover:text-[#8d5132]"><span className="flex h-11 w-11 items-center justify-center rounded-full bg-white"><Plus className="h-5 w-5" /></span><span className="text-sm font-medium">Add another address</span></button>}
    </div>
  </main>;
}
