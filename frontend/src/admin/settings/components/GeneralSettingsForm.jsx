import { useState } from 'react';
function SettingRow({ setting, onSave, pending }) {
  const [value, setValue] = useState(setting.SettingValue ?? '');
  const [error, setError] = useState('');
  const save = (event) => {
    event.preventDefault(); setError('');
    let parsed = value;
    try { if (setting.ValueType === 'json') parsed = JSON.parse(value); if (setting.ValueType === 'boolean') parsed = value === 'true'; if (setting.ValueType === 'number') { parsed = Number(value); if (!Number.isFinite(parsed) || value.trim() === '') throw new Error(); } }
    catch { setError(`Enter a valid ${setting.ValueType} value.`); return; }
    onSave(setting.SettingKey, { settingValue: parsed, valueType: setting.ValueType || 'string', isPublic: Boolean(setting.IsPublic), description: setting.Description || undefined });
  };
  return <form className="grid items-start gap-3 border-b border-stone-100 py-5 last:border-0 md:grid-cols-[1fr_1.4fr_auto]" onSubmit={save}><div><label htmlFor={`setting-${setting.SettingKey}`} className="text-sm font-semibold">{setting.SettingKey}</label><p className="mt-1 text-xs leading-5 text-stone-500">{setting.Description || setting.ValueType} / {setting.IsPublic ? 'Public' : 'Private'}</p></div><div>{setting.ValueType === 'boolean' ? <select id={`setting-${setting.SettingKey}`} className="input" value={value} onChange={(event) => setValue(event.target.value)}><option value="true">Enabled</option><option value="false">Disabled</option></select> : <textarea id={`setting-${setting.SettingKey}`} className="input min-h-20" value={value} onChange={(event) => setValue(event.target.value)} />}<p role="alert" className="mt-1 text-xs text-red-700">{error}</p></div><button className="btn-secondary" disabled={pending || value === (setting.SettingValue ?? '')}>Save</button></form>;
}
export function GeneralSettingsForm({ settings = [], onSave, pending }) {
  return <section className="admin-panel"><h2 className="text-xl font-semibold">Store configuration</h2><p className="mt-2 text-sm text-stone-500">Edit one setting at a time. Each setting keeps its configured type and visibility.</p>{!settings.length && <p className="mt-6 text-sm text-stone-500">No store settings have been configured.</p>}{settings.map((setting) => <SettingRow key={`${setting.SettingKey}-${setting.SettingValue}`} setting={setting} onSave={onSave} pending={pending} />)}</section>;
}
