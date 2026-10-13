import { useState } from 'react';

export function SeoForm({ initial = {}, pending = false, onSubmit }) {
  const [form, setForm] = useState({ entityType: 'PATH', entityId: '', path: '/', metaTitle: '', metaDescription: '', canonicalUrl: '', robotsDirective: 'index,follow', ogTitle: '', ogDescription: '', ogImageUrl: '', ...initial });
  const set = (key, value) => setForm({ ...form, [key]: value });
  return (
    <form className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm" onSubmit={(event) => { event.preventDefault(); onSubmit({ ...form, entityId: form.entityId || null }); }}>
      <h2 className="text-xl font-semibold">SEO metadata</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <select className="input" value={form.entityType} onChange={(e) => set('entityType', e.target.value)}><option>PATH</option><option>PAGE</option><option>PRODUCT</option><option>CATEGORY</option></select>
        <input className="input" value={form.path || ''} onChange={(e) => set('path', e.target.value)} placeholder="/path" />
        <input className="input md:col-span-2" value={form.entityId || ''} onChange={(e) => set('entityId', e.target.value)} placeholder="Entity ID optional" />
        <input className="input" value={form.metaTitle} onChange={(e) => set('metaTitle', e.target.value)} placeholder="Meta title" maxLength={70} />
        <select className="input" value={form.robotsDirective || ''} onChange={(e) => set('robotsDirective', e.target.value)}><option>index,follow</option><option>noindex,follow</option><option>index,nofollow</option><option>noindex,nofollow</option></select>
        <textarea className="input min-h-24 md:col-span-2" value={form.metaDescription} onChange={(e) => set('metaDescription', e.target.value)} placeholder="Meta description" maxLength={170} />
        <input className="input md:col-span-2" value={form.canonicalUrl || ''} onChange={(e) => set('canonicalUrl', e.target.value)} placeholder="Canonical URL" />
        <input className="input" value={form.ogTitle || ''} onChange={(e) => set('ogTitle', e.target.value)} placeholder="OG title" />
        <input className="input" value={form.ogImageUrl || ''} onChange={(e) => set('ogImageUrl', e.target.value)} placeholder="OG image URL" />
        <textarea className="input min-h-20 md:col-span-2" value={form.ogDescription || ''} onChange={(e) => set('ogDescription', e.target.value)} placeholder="OG description" />
      </div>
      <button className="btn-primary mt-4" disabled={pending || !form.metaTitle || !form.metaDescription}>Save SEO</button>
    </form>
  );
}
