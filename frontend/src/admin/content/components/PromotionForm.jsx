import { useState } from 'react';

export function PromotionForm({ initial = {}, pending = false, onSubmit }) {
  const [form, setForm] = useState({ title: '', subtitle: '', description: '', imageUrl: '', backgroundImageUrl: '', layoutType: 'IMAGE_LEFT', buttonText: '', buttonUrl: '', displayOrder: 0, status: 'DRAFT', ...initial });
  const set = (key, value) => setForm({ ...form, [key]: value });
  return (
    <form className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm" onSubmit={(event) => { event.preventDefault(); onSubmit(form); }}>
      <h2 className="text-xl font-semibold">Promotion</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <input className="input md:col-span-2" value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Title" />
        <input className="input" value={form.subtitle || ''} onChange={(e) => set('subtitle', e.target.value)} placeholder="Subtitle" />
        <select className="input" value={form.layoutType} onChange={(e) => set('layoutType', e.target.value)}><option>IMAGE_LEFT</option><option>IMAGE_RIGHT</option><option>FULL_WIDTH</option><option>TEXT_ONLY</option></select>
        <textarea className="input min-h-24 md:col-span-2" value={form.description || ''} onChange={(e) => set('description', e.target.value)} placeholder="Description" />
        <input className="input" value={form.imageUrl || ''} onChange={(e) => set('imageUrl', e.target.value)} placeholder="Image URL" />
        <input className="input" value={form.backgroundImageUrl || ''} onChange={(e) => set('backgroundImageUrl', e.target.value)} placeholder="Background image URL" />
        <input className="input" value={form.buttonText || ''} onChange={(e) => set('buttonText', e.target.value)} placeholder="CTA text" />
        <input className="input" value={form.buttonUrl || ''} onChange={(e) => set('buttonUrl', e.target.value)} placeholder="CTA URL" />
        <input className="input" type="number" value={form.displayOrder} onChange={(e) => set('displayOrder', Number(e.target.value))} />
        <select className="input" value={form.status} onChange={(e) => set('status', e.target.value)}><option>DRAFT</option><option>PUBLISHED</option><option>ARCHIVED</option></select>
      </div>
      <button className="btn-primary mt-4" disabled={pending || !form.title}>Save promotion</button>
    </form>
  );
}
