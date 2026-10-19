import { Plus } from 'lucide-react';
import { AdminListOverview, AdminSearchField } from '../../shared/AdminListOverview.jsx';
import { useState } from 'react';
import { NewSettingForm } from '../components/NewSettingForm.jsx';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { adminSettingsApi } from '../api/adminSettingsApi.js';
import { GeneralSettingsForm } from '../components/GeneralSettingsForm.jsx';
import { AdminQueryState, AdminMutationFeedback } from '../../shared/AdminUi.jsx';
export function AdminSettingsPage() {
  const qc = useQueryClient();
  const [version,setVersion] = useState(0);
  const [search,setSearch]=useState(''),[visibility,setVisibility]=useState(''),[creating,setCreating]=useState(false);
  const q = useQuery({ queryKey: ['admin-settings'], queryFn: async () => (await adminSettingsApi.list()).data.data.settings });
  const update = useMutation({ mutationFn: ({ key, payload }) => adminSettingsApi.update(key, payload), onSuccess: () => {qc.invalidateQueries({queryKey:['admin-list-summary','settings']});setCreating(false);setVersion((value) => value+1);qc.invalidateQueries({ queryKey: ['admin-settings'] });} });
  return <main className="mx-auto max-w-[1500px] px-4 py-10 sm:px-7"><AdminListOverview section="settings" title="Settings" pending={q.isFetching} onRefresh={()=>q.refetch()} actions={<button type="button" className="btn-primary" onClick={()=>setCreating(!creating)}><Plus size={14}/>{creating?'Close form':'Add setting'}</button>}/><section className="admin-panel mb-5 flex flex-wrap items-end gap-4"><AdminSearchField label="Search settings" placeholder="Setting key or description" value={search} onChange={setSearch}/><label className="text-xs font-medium text-stone-500">Visibility<select className="input mt-2 sm:w-48" value={visibility} onChange={event=>setVisibility(event.target.value)}><option value="">All settings</option><option value="public">Public</option><option value="private">Private</option></select></label><button type="button" className="btn-secondary" disabled={!search&&!visibility} onClick={()=>{setSearch('');setVisibility('');}}>Clear filters</button></section><AdminMutationFeedback mutations={[update]} /><AdminQueryState query={q} />{q.data && !q.isError && <GeneralSettingsForm settings={q.data.filter(row=>(!visibility||Boolean(row.IsPublic)===(visibility==='public'))&&`${row.SettingKey} ${row.Description||''}`.toLowerCase().includes(search.toLowerCase()))} pending={update.isPending} onSave={(key, payload) => update.mutate({ key, payload })} />}{creating&&<NewSettingForm key={version} pending={update.isPending} onSave={(key,payload) => update.mutate({key,payload})} />}<section className="admin-panel mt-5"><h2 className="text-lg font-semibold">Store operations</h2><div className="mt-4 flex flex-wrap gap-3"><Link className="btn-secondary" to="/admin/shipping-settings">Shipping configuration</Link><Link className="btn-secondary" to="/admin/audit-logs">Settings change history</Link></div></section></main>;
}
