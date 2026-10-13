import { useState } from 'react';
import { BannerPreview } from './BannerPreview.jsx';

export function BannerForm({ initial = {}, pending = false, onSubmit }) {
  const [form, setForm] = useState({ title: '', subtitle: '', description: '', desktopImageUrl: '', mobileImageUrl: '', altText: '', buttonText: '', buttonUrl: '', secondaryButtonText: '', secondaryButtonUrl: '', displayOrder: 0, status: 'DRAFT', ...initial });
  const set = (key, value) => setForm({ ...form, [key]: value });
  return (
    <section className="grid gap-5 lg:grid-cols-[1fr_380px]">
      <form className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm" onSubmit={(event) => { event.preventDefault(); onSubmit(form); }}>
        <h2 className="text-xl font-semibold">Banner</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <input className="input md:col-span-2" value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Title" />
          <input className="input" value={form.subtitle || ''} onChange={(e) => set('subtitle', e.target.value)} placeholder="Subtitle" />
          <input className="input" value={form.altText || ''} onChange={(e) => set('altText', e.target.value)} placeholder="Alt text" />
          <input className="input md:col-span-2" value={form.desktopImageUrl || ''} onChange={(e) => set('desktopImageUrl', e.target.value)} placeholder="Desktop image URL" />
          <input className="input md:col-span-2" value={form.mobileImageUrl || ''} onChange={(e) => set('mobileImageUrl', e.target.value)} placeholder="Mobile image URL" />
          <textarea className="input min-h-24 md:col-span-2" value={form.description || ''} onChange={(e) => set('description', e.target.value)} placeholder="Description" />
          <input className="input" value={form.buttonText || ''} onChange={(e) => set('buttonText', e.target.value)} placeholder="Primary CTA text" />
          <input className="input" value={form.buttonUrl || ''} onChange={(e) => set('buttonUrl', e.target.value)} placeholder="Primary CTA URL" />
          <input className="input" value={form.secondaryButtonText || ''} onChange={(e) => set('secondaryButtonText', e.target.value)} placeholder="Secondary CTA text" />
          <input className="input" value={form.secondaryButtonUrl || ''} onChange={(e) => set('secondaryButtonUrl', e.target.value)} placeholder="Secondary CTA URL" />
          <input className="input" type="number" value={form.displayOrder} onChange={(e) => set('displayOrder', Number(e.target.value))} />
          <select className="input" value={form.status} onChange={(e) => set('status', e.target.value)}><option>DRAFT</option><option>PUBLISHED</option><option>ARCHIVED</option></select>
        </div>
        <button className="btn-primary mt-4" disabled={pending || !form.title}>Save banner</button>
      </form>
      <BannerPreview banner={form} />
    </section>
  );
}
