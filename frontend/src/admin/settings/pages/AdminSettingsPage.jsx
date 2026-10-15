import { useState } from 'react';
import { NewSettingForm } from '../components/NewSettingForm.jsx';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { adminSettingsApi } from '../api/adminSettingsApi.js';
import { GeneralSettingsForm } from '../components/GeneralSettingsForm.jsx';
import { AdminPageHeader, AdminQueryState, AdminMutationFeedback } from '../../shared/AdminUi.jsx';
export function AdminSettingsPage() {
  const qc = useQueryClient();
  const [version,setVersion] = useState(0);
  const q = useQuery({ queryKey: ['admin-settings'], queryFn: async () => (await adminSettingsApi.list()).data.data.settings });
  const update = useMutation({ mutationFn: ({ key, payload }) => adminSettingsApi.update(key, payload), onSuccess: () => {setVersion((value) => value+1);qc.invalidateQueries({ queryKey: ['admin-settings'] });} });
  return <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6"><AdminPageHeader title="Settings" description="Manage the store's configured values and visibility." /><AdminMutationFeedback mutations={[update]} /><AdminQueryState query={q} />{q.data && !q.isError && <GeneralSettingsForm settings={q.data} pending={update.isPending} onSave={(key, payload) => update.mutate({ key, payload })} />}<NewSettingForm key={version} pending={update.isPending} onSave={(key,payload) => update.mutate({key,payload})} /><section className="admin-panel mt-5"><h2 className="text-lg font-semibold">Store operations</h2><div className="mt-4 flex flex-wrap gap-3"><Link className="btn-secondary" to="/admin/shipping-settings">Shipping configuration</Link><Link className="btn-secondary" to="/admin/audit-logs">Settings change history</Link></div></section></main>;
}
