import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminSettingsApi } from '../api/adminSettingsApi.js';
import { GeneralSettingsForm } from '../components/GeneralSettingsForm.jsx';
import { StorePolicySettings } from '../components/StorePolicySettings.jsx';
import { StoreSettingsNavigation } from '../components/StoreSettingsNavigation.jsx';
import { TaxSettingsForm } from '../components/TaxSettingsForm.jsx';
export function AdminSettingsPage() { const qc = useQueryClient(); const q = useQuery({ queryKey: ['admin-settings'], queryFn: async () => (await adminSettingsApi.list()).data.data.settings }); const update = useMutation({ mutationFn: ({ key, payload }) => adminSettingsApi.update(key, payload), onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-settings'] }) }); return <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6"><h1 className="text-4xl font-semibold">Settings</h1><div className="mt-6 grid gap-5"><StoreSettingsNavigation /><GeneralSettingsForm settings={q.data || []} pending={update.isPending} onSave={(key, payload) => update.mutate({ key, payload })} /><TaxSettingsForm /><StorePolicySettings /></div></main>; }
