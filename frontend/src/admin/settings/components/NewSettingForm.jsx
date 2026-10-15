import { useState } from 'react';
export function NewSettingForm({ pending, onSave }) {
  const [form, setForm] = useState({ key: '', value: '', type: 'string', description: '', isPublic: false });
  const [error, setError] = useState('');
  const submit = (event) => {
    event.preventDefault(); setError('');
    let value = form.value;
    try {
      if (form.type === 'json') value = JSON.parse(value);
      if (form.type === 'number') { value = Number(value); if (!form.value.trim() || !Number.isFinite(value)) throw new Error(); }
      if (form.type === 'boolean') value = value === 'true';
    } catch { setError(`Enter a valid ${form.type} value.`); return; }
    onSave(form.key.trim(), { settingValue: value, valueType: form.type, description: form.description || undefined, isPublic: form.isPublic });
  };
  return <form className="admin-panel mt-5" onSubmit={submit}><h2 className="text-lg font-semibold">Add a setting</h2><p className="mt-2 text-xs leading-5 text-stone-500">Use a setting name supported by your store. New names are stored for configuration; their behavior depends on the feature that reads them.</p><div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="text-xs font-semibold">Setting name<input required maxLength={100} className="input mt-2" value={form.key} onChange={(event) => setForm({ ...form, key: event.target.value })} /></label><label className="text-xs font-semibold">Value type<select className="input mt-2" value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value, value: event.target.value === 'boolean' ? 'false' : '' })}>{['string','number','boolean','json'].map((type) => <option key={type}>{type}</option>)}</select></label><label className="text-xs font-semibold">Value{form.type === 'boolean' ? <select className="input mt-2" value={form.value} onChange={(event) => setForm({ ...form, value:event.target.value })}><option value="false">Disabled</option><option value="true">Enabled</option></select> : <textarea className="input mt-2" value={form.value} onChange={(event) => setForm({ ...form, value:event.target.value })} />}</label><label className="text-xs font-semibold">Description<textarea maxLength={500} className="input mt-2" value={form.description} onChange={(event) => setForm({ ...form, description:event.target.value })} /></label></div><label className="mt-4 flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isPublic} onChange={(event) => setForm({ ...form, isPublic:event.target.checked })} />Publicly visible</label>{error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}<button className="btn-primary mt-4" disabled={pending}>Save setting</button></form>;
}
