import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Image, Plus, RefreshCw, Save, Search, X } from 'lucide-react';
import { adminCategoriesApi } from '../api/adminCategoriesApi.js';
import { CategoryTable } from '../components/CategoryTable.jsx';

const blankCategory = {
  CategoryName: '',
  Slug: '',
  ParentCategoryId: '',
  Description: '',
  ImageUrl: '',
  DisplayOrder: 0,
  IsActive: true,
};

function slugify(value) {
  return String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function CategoryForm({ category, categories, pending, onCancel, onSubmit }) {
  const [form, setForm] = useState(category || blankCategory);
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const editing = Boolean(category?.CategoryId);
  const parentOptions = categories.filter((item) => item.CategoryId !== category?.CategoryId);

  function submit(event) {
    event.preventDefault();
    onSubmit({
      ParentCategoryId: form.ParentCategoryId || null,
      CategoryName: form.CategoryName.trim(),
      Slug: form.Slug.trim(),
      Description: form.Description || null,
      ImageUrl: form.ImageUrl || null,
      DisplayOrder: Number(form.DisplayOrder) || 0,
      IsActive: Boolean(form.IsActive),
    });
  }

  return (
    <form className="rounded-md border border-stone-200 bg-white p-5 shadow-sm" onSubmit={submit}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">{editing ? 'Edit category' : 'New category'}</h2>
          <p className="mt-1 text-sm text-stone-500">Organize products into storefront collections and nested groups.</p>
        </div>
        <button className="icon-btn" type="button" onClick={onCancel} aria-label="Close form"><X className="h-4 w-4" /></button>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="grid gap-1 text-sm font-medium text-stone-700">Category name
          <input className="input" value={form.CategoryName} onChange={(event) => {
            const value = event.target.value;
            setForm((current) => ({ ...current, CategoryName: value, Slug: current.Slug || slugify(value) }));
          }} required />
        </label>
        <label className="grid gap-1 text-sm font-medium text-stone-700">Slug
          <input className="input" value={form.Slug} onChange={(event) => set('Slug', slugify(event.target.value))} required />
        </label>
        <label className="grid gap-1 text-sm font-medium text-stone-700">Parent category
          <select className="input" value={form.ParentCategoryId || ''} onChange={(event) => set('ParentCategoryId', event.target.value)}>
            <option value="">Top-level category</option>
            {parentOptions.map((item) => <option key={item.CategoryId} value={item.CategoryId}>{item.CategoryName}</option>)}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-medium text-stone-700">Display order
          <input className="input" type="number" min="0" value={form.DisplayOrder ?? 0} onChange={(event) => set('DisplayOrder', event.target.value)} />
        </label>
        <label className="grid gap-1 text-sm font-medium text-stone-700 md:col-span-2">Image URL
          <input className="input" type="url" value={form.ImageUrl || ''} onChange={(event) => set('ImageUrl', event.target.value)} placeholder="https://..." />
        </label>
        <label className="grid gap-1 text-sm font-medium text-stone-700 md:col-span-2">Description
          <textarea className="input min-h-24" value={form.Description || ''} onChange={(event) => set('Description', event.target.value)} />
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold text-stone-700">
          <input type="checkbox" checked={Boolean(form.IsActive)} onChange={(event) => set('IsActive', event.target.checked)} />
          Active on storefront
        </label>
        <div className="flex h-24 items-center justify-center overflow-hidden rounded-md border border-stone-200 bg-stone-50">
          {form.ImageUrl ? <img className="h-full w-full object-cover" src={form.ImageUrl} alt="Category preview" /> : <Image className="h-6 w-6 text-stone-400" />}
        </div>
      </div>

      <div className="mt-5 flex gap-3">
        <button className="btn-primary" disabled={pending || !form.CategoryName || !form.Slug}><Save className="h-4 w-4" />{pending ? 'Saving...' : 'Save category'}</button>
        <button className="btn-secondary" type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

export function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const query = useQuery({
    queryKey: ['admin-categories', search],
    queryFn: async () => (await adminCategoriesApi.list({ search, limit: 200 })).data.data,
  });
  const categories = query.data || [];
  const categoryNames = useMemo(() => Object.fromEntries(categories.map((item) => [item.CategoryId, item.CategoryName])), [categories]);
  const rows = useMemo(() => categories
    .filter((item) => activeFilter === 'all' || Boolean(item.IsActive) === (activeFilter === 'active'))
    .map((item) => ({ ...item, ParentCategoryName: categoryNames[item.ParentCategoryId] })), [categories, activeFilter, categoryNames]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
  const createMutation = useMutation({ mutationFn: adminCategoriesApi.create, onSuccess: () => { invalidate(); setShowForm(false); } });
  const updateMutation = useMutation({ mutationFn: ({ id, payload }) => adminCategoriesApi.update(id, payload), onSuccess: () => { invalidate(); setEditing(null); setShowForm(false); } });
  const deleteMutation = useMutation({ mutationFn: adminCategoriesApi.remove, onSuccess: invalidate });

  function save(payload) {
    if (editing?.CategoryId) updateMutation.mutate({ id: editing.CategoryId, payload });
    else createMutation.mutate(payload);
  }

  const error = query.error || createMutation.error || updateMutation.error || deleteMutation.error;
  const errorMessage = error?.response?.data?.error?.message || error?.message;
  const pending = createMutation.isPending || updateMutation.isPending;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase text-[#697565]">Catalog</p>
          <h1 className="mt-1 text-4xl font-semibold">Categories</h1>
          <p className="mt-2 text-sm text-stone-600">Build the storefront hierarchy, control ordering, and manage category visibility.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary" type="button" onClick={() => query.refetch()}><RefreshCw className="h-4 w-4" />Refresh</button>
          <button className="btn-primary" type="button" onClick={() => { setEditing(null); setShowForm(true); }}><Plus className="h-4 w-4" />Add category</button>
        </div>
      </div>

      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-md border border-stone-200 bg-white p-4 shadow-sm"><p className="text-sm text-stone-500">Total</p><p className="mt-1 text-2xl font-semibold">{categories.length}</p></div>
        <div className="rounded-md border border-stone-200 bg-white p-4 shadow-sm"><p className="text-sm text-stone-500">Active</p><p className="mt-1 text-2xl font-semibold">{categories.filter((item) => item.IsActive).length}</p></div>
        <div className="rounded-md border border-stone-200 bg-white p-4 shadow-sm"><p className="text-sm text-stone-500">Top level</p><p className="mt-1 text-2xl font-semibold">{categories.filter((item) => !item.ParentCategoryId).length}</p></div>
      </section>

      <div className="mt-6 grid gap-4">
        <section className="grid gap-3 md:grid-cols-[1fr_13rem]">
          <label className="flex items-center gap-2 rounded-md border border-stone-300 bg-white px-3 py-2 shadow-sm focus-within:border-[#b56b45] focus-within:ring-2 focus-within:ring-[#b56b45]/20">
            <Search className="h-4 w-4 text-stone-500" /><input className="w-full bg-transparent text-sm outline-none" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search categories" />
          </label>
          <select className="input" value={activeFilter} onChange={(event) => setActiveFilter(event.target.value)}><option value="all">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option></select>
        </section>

        {(showForm || editing) && <CategoryForm key={editing?.CategoryId || 'new'} category={editing} categories={categories} pending={pending} onCancel={() => { setEditing(null); setShowForm(false); }} onSubmit={save} />}
        {errorMessage && <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p>}
        <CategoryTable rows={rows} loading={query.isLoading} onEdit={(item) => { setEditing(item); setShowForm(false); }} onToggle={(item) => updateMutation.mutate({ id: item.CategoryId, payload: { IsActive: !item.IsActive } })} onDelete={(item) => { if (window.confirm(`Delete ${item.CategoryName}? Products using it may prevent deletion.`)) deleteMutation.mutate(item.CategoryId); }} />
      </div>
    </main>
  );
}
