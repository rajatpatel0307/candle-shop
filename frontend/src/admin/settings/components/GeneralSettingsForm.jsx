import { AdminTableHeading } from '../../shared/AdminListOverview.jsx';
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
  return <tr className="border-t align-top"><td><label htmlFor={`setting-${setting.SettingKey}`} className="font-medium">{setting.SettingKey}</label><p className="mt-1 max-w-xs text-xs leading-5 text-stone-500">{setting.Description}</p></td><td>{setting.ValueType}</td><td><span className="rounded border border-stone-200 px-2 py-1 text-[11px]">{setting.IsPublic?'Public':'Private'}</span></td><td><form className="flex items-start gap-3" onSubmit={save}><div className="min-w-0 flex-1">{setting.ValueType==='boolean'?<select id={`setting-${setting.SettingKey}`} className="input" value={value} onChange={event=>setValue(event.target.value)}><option value="true">Enabled</option><option value="false">Disabled</option></select>:<textarea id={`setting-${setting.SettingKey}`} className="input min-h-20" value={value} onChange={event=>setValue(event.target.value)}/>}<p role="alert" className="mt-1 text-xs text-red-700">{error}</p></div><button className="btn-secondary" disabled={pending||value===(setting.SettingValue??'')}>Save</button></form></td></tr>;

}
export function GeneralSettingsForm({ settings = [], onSave, pending }) {
  return <section className="overflow-hidden rounded border border-[#e4dacd] bg-[#fffdf8]"><AdminTableHeading title="Store configuration" count={settings.length}/><div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left"><thead><tr>{['Setting / description','Type','Visibility','Value / action'].map(label=><th scope="col" key={label}>{label}</th>)}</tr></thead><tbody>{!settings.length&&<tr><td colSpan={4} className="py-12 text-center text-stone-500">No settings match these filters.</td></tr>}{settings.map(setting=><SettingRow key={`${setting.SettingKey}-${setting.SettingValue}`} setting={setting} onSave={onSave} pending={pending}/>)}</tbody></table></div></section>;
}
