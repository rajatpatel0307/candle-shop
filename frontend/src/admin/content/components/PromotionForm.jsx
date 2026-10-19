import { ImageInput, useImageUploadState } from '../../../shared/components/ImageInput.jsx';
import { useState } from 'react';

export function PromotionForm({ initial = {}, pending = false, onSubmit }) {
  const {imageBusy,onImageBusy}=useImageUploadState();
  const [form, setForm] = useState({ title: '', subtitle: '', description: '', imageUrl: '', backgroundImageUrl: '', layoutType: 'IMAGE_LEFT', buttonText: '', buttonUrl: '', displayOrder: 0, status: 'DRAFT', ...initial });
  const set = (key, value) => setForm(current=>({ ...current, [key]: value }));
  return (
    <form className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm" onSubmit={(event) => { event.preventDefault(); if(!imageBusy)onSubmit(form); }}>
      <h2 className="text-xl font-semibold">Promotion</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <input className="input md:col-span-2" value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Title" />
        <input className="input" value={form.subtitle || ''} onChange={(e) => set('subtitle', e.target.value)} placeholder="Subtitle" />
        <select className="input" value={form.layoutType} onChange={(e) => set('layoutType', e.target.value)}><option>IMAGE_LEFT</option><option>IMAGE_RIGHT</option><option>FULL_WIDTH</option><option>TEXT_ONLY</option></select>
        <textarea className="input min-h-24 md:col-span-2" value={form.description || ''} onChange={(e) => set('description', e.target.value)} placeholder="Description" />
          <ImageInput className="md:col-span-2" label="Image" value={form.imageUrl||''} onChange={value=>set('imageUrl',value)} onBusyChange={busy=>onImageBusy('imageUrl',busy)} disabled={pending}/>
          <ImageInput className="md:col-span-2" label="Background image" value={form.backgroundImageUrl||''} onChange={value=>set('backgroundImageUrl',value)} onBusyChange={busy=>onImageBusy('backgroundImageUrl',busy)} disabled={pending}/>
        <input className="input" value={form.buttonText || ''} onChange={(e) => set('buttonText', e.target.value)} placeholder="CTA text" />
        <input className="input" value={form.buttonUrl || ''} onChange={(e) => set('buttonUrl', e.target.value)} placeholder="CTA URL" />
        <input className="input" type="number" value={form.displayOrder} onChange={(e) => set('displayOrder', Number(e.target.value))} />
        <select className="input" value={form.status} onChange={(e) => set('status', e.target.value)}><option>DRAFT</option><option>PUBLISHED</option><option>ARCHIVED</option></select>
      </div>
      <button className="btn-primary mt-4" disabled={imageBusy || pending || !form.title}>Save promotion</button>
    </form>
  );
}
