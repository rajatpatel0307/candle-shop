import { ImageInput, useImageUploadState } from '../../../shared/components/ImageInput.jsx';
import { AdminListOverview, AdminSearchField } from '../../shared/AdminListOverview.jsx';
import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Flame, Plus, Save, X } from 'lucide-react';
import { adminBrandsApi } from '../api/adminBrandsApi.js';
import { BrandTable } from '../components/BrandTable.jsx';

const blankBrand = { BrandName: '', Slug: '', Description: '', LogoUrl: '', IsActive: true };

function slugify(value) {
  return String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function BrandForm({ brand, pending, onCancel, onSubmit }) {
  const {imageBusy,onImageBusy}=useImageUploadState();
  const [form, setForm] = useState(brand || blankBrand);
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const editing = Boolean(brand?.BrandId);

  function submit(event) {
    event.preventDefault();
    if(imageBusy)return;
    onSubmit({
      BrandName: form.BrandName.trim(),
      Slug: form.Slug.trim(),
      Description: form.Description || null,
      LogoUrl: form.LogoUrl || null,
      IsActive: Boolean(form.IsActive),
    });
  }

  return (
    <form className="rounded-md border border-stone-200 bg-white p-5 shadow-sm" onSubmit={submit}>
      <div className="flex items-start justify-between gap-4">
        <div><h2 className="text-xl font-semibold">{editing ? 'Edit brand' : 'New brand'}</h2><p className="mt-1 text-sm text-stone-500">Manage maker details, logos, and storefront availability.</p></div>
        <button className="icon-btn" type="button" onClick={onCancel} aria-label="Close form"><X className="h-4 w-4" /></button>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="grid gap-1 text-sm font-medium text-stone-700">Brand name
          <input className="input" value={form.BrandName} onChange={(event) => {
            const value = event.target.value;
            setForm((current) => ({ ...current, BrandName: value, Slug: current.Slug || slugify(value) }));
          }} required />
        </label>
        <label className="grid gap-1 text-sm font-medium text-stone-700">Slug
          <input className="input" value={form.Slug} onChange={(event) => set('Slug', slugify(event.target.value))} required />
        </label>
        <ImageInput className="md:col-span-2" label="Brand logo" value={form.LogoUrl||''} onChange={value=>set('LogoUrl',value)} onBusyChange={busy=>onImageBusy('LogoUrl',busy)} disabled={pending}/>
        <label className="grid gap-1 text-sm font-medium text-stone-700 md:col-span-2">Description
          <textarea className="input min-h-24" value={form.Description || ''} onChange={(event) => set('Description', event.target.value)} />
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold text-stone-700"><input type="checkbox" checked={Boolean(form.IsActive)} onChange={(event) => set('IsActive', event.target.checked)} />Active on storefront</label>
        <div className="flex h-24 items-center justify-center overflow-hidden rounded-md border border-stone-200 bg-stone-50">
          {form.LogoUrl ? <img className="h-full w-full object-contain p-2" src={form.LogoUrl} alt="Brand logo preview" /> : <Flame className="h-6 w-6 text-stone-400" />}
        </div>
      </div>
      <div className="mt-5 flex gap-3">
        <button className="btn-primary" disabled={pending || imageBusy || !form.BrandName || !form.Slug}><Save className="h-4 w-4" />{pending ? 'Saving...' : 'Save brand'}</button>
        <button className="btn-secondary" type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

export function AdminBrandsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const query = useQuery({ queryKey: ['admin-brands', search], queryFn: async () => (await adminBrandsApi.list({ search, limit: 200 })).data.data });
  const brands = query.data || [];
  const rows = useMemo(() => brands.filter((item) => activeFilter === 'all' || Boolean(item.IsActive) === (activeFilter === 'active')), [brands, activeFilter]);
  const invalidate = () => { queryClient.invalidateQueries({ queryKey: ['admin-brands'] }); queryClient.invalidateQueries({ queryKey: ['admin-list-summary', 'brands'] }); };
  const createMutation = useMutation({ mutationFn: adminBrandsApi.create, onSuccess: () => { invalidate(); setShowForm(false); } });
  const updateMutation = useMutation({ mutationFn: ({ id, payload }) => adminBrandsApi.update(id, payload), onSuccess: () => { invalidate(); setEditing(null); setShowForm(false); } });
  const deleteMutation = useMutation({ mutationFn: adminBrandsApi.remove, onSuccess: invalidate });

  function save(payload) {
    if (editing?.BrandId) updateMutation.mutate({ id: editing.BrandId, payload });
    else createMutation.mutate(payload);
  }

  const error = query.error || createMutation.error || updateMutation.error || deleteMutation.error;
  const errorMessage = error?.response?.data?.error?.message || error?.message;
  const pending = createMutation.isPending || updateMutation.isPending;

  return (
    <main className="mx-auto max-w-[1500px] px-4 py-8 sm:px-7">
      <AdminListOverview section="brands" title="Brands" pending={query.isFetching} onRefresh={()=>query.refetch()} actions={<button className="btn-primary" type="button" onClick={()=>{setEditing(null);setShowForm(true);}}><Plus className="h-4 w-4"/>Add brand</button>}/>

      <div className="mt-6 grid gap-4">
        <section className="admin-panel flex flex-wrap items-end gap-4">
          <AdminSearchField label="Search brands" placeholder="Name or slug" value={search} onChange={setSearch}/>
          <label className="text-xs font-medium text-stone-500">Status<select aria-label="Brands status" className="input mt-2 sm:w-48" value={activeFilter} onChange={event=>setActiveFilter(event.target.value)}><option value="all">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option></select></label>
          <button type="button" className="btn-secondary" disabled={!search && activeFilter==='all'} onClick={()=>{setSearch('');setActiveFilter('all');}}>Clear filters</button>
        </section>

        {(showForm || editing) && <BrandForm key={editing?.BrandId || 'new'} brand={editing} pending={pending} onCancel={() => { setEditing(null); setShowForm(false); }} onSubmit={save} />}
        {errorMessage && <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p>}
        <BrandTable rows={rows} loading={query.isLoading} onEdit={(item) => { setEditing(item); setShowForm(false); }} onToggle={(item) => updateMutation.mutate({ id: item.BrandId, payload: { IsActive: !item.IsActive } })} onDelete={(item) => { if (window.confirm(`Delete ${item.BrandName}? Products using it may prevent deletion.`)) deleteMutation.mutate(item.BrandId); }} />
      </div>
    </main>
  );
}
