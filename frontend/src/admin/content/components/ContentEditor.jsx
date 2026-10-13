import { useEffect, useState } from 'react';

export function ContentEditor({ initial = {}, pending = false, onSubmit }) {
  const [form, setForm] = useState({ title: '', slug: '', pageType: 'CUSTOM', summary: '', content: '', contentFormat: 'HTML', status: 'DRAFT', ...initial });
  useEffect(() => setForm({ title: '', slug: '', pageType: 'CUSTOM', summary: '', content: '', contentFormat: 'HTML', status: 'DRAFT', ...initial }), [initial?.id]);
  const set = (key, value) => setForm({ ...form, [key]: value });
  return (
    <form className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm" onSubmit={(event) => { event.preventDefault(); onSubmit(form); }}>
      <h2 className="text-xl font-semibold">Content page</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <input className="input" value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Title" />
        <input className="input" value={form.slug} onChange={(e) => set('slug', e.target.value)} placeholder="slug" />
        <select className="input" value={form.pageType} onChange={(e) => set('pageType', e.target.value)}><option>ABOUT</option><option>CONTACT</option><option>TERMS</option><option>PRIVACY</option><option>CUSTOM</option></select>
        <select className="input" value={form.status} onChange={(e) => set('status', e.target.value)}><option>DRAFT</option><option>PUBLISHED</option><option>ARCHIVED</option></select>
        <textarea className="input min-h-20 md:col-span-2" value={form.summary || ''} onChange={(e) => set('summary', e.target.value)} placeholder="Summary" />
        <textarea className="input min-h-72 font-mono text-sm md:col-span-2" value={form.content} onChange={(e) => set('content', e.target.value)} placeholder="<h2>Content</h2><p>...</p>" />
      </div>
      <button className="btn-primary mt-4" disabled={pending || !form.title || !form.slug || !form.content}>Save page</button>
    </form>
  );
}
