import { AdminTableHeading } from '../../shared/AdminListOverview.jsx';
import { Edit3, ExternalLink, Flame, Power, Trash2 } from 'lucide-react';

function ActiveBadge({ active }) {
  return <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${active ? 'border-green-200 bg-green-50 text-green-700' : 'border-stone-200 bg-stone-100 text-stone-600'}`}>{active ? 'Active' : 'Inactive'}</span>;
}

export function BrandTable({ rows = [], loading, onEdit, onToggle, onDelete }) {
  return (
    <section className="overflow-hidden rounded-md border border-stone-200 bg-white shadow-sm">
      <AdminTableHeading title="Brand directory" count={rows.length}/>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-stone-100 text-xs uppercase text-stone-600">
            <tr>
              <th className="px-4 py-3">Brand</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Logo</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td className="px-4 py-10 text-center text-stone-500" colSpan={5}>Loading brands...</td></tr>}
            {!loading && rows.length === 0 && <tr><td className="px-4 py-10 text-center text-stone-500" colSpan={5}>No brands found.</td></tr>}
            {!loading && rows.map((row) => (
              <tr key={row.BrandId} className="border-t border-stone-100 align-top">
                <td className="px-4 py-4">
                  <p className="font-semibold">{row.BrandName || 'Untitled brand'}</p>
                  <p className="mt-1 max-w-md text-xs text-stone-500">{row.Description || 'No description added.'}</p>
                </td>
                <td className="px-4 py-4 font-mono text-xs text-stone-600">{row.Slug}</td>
                <td className="px-4 py-4">
                  {row.LogoUrl ? (
                    <a className="inline-flex items-center gap-2 text-[#8d5132]" href={row.LogoUrl} target="_blank" rel="noreferrer">
                      <img className="h-9 w-9 rounded-md border border-stone-200 object-contain" src={row.LogoUrl} alt="" />
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ) : <span className="inline-flex items-center gap-1 text-stone-500"><Flame className="h-3.5 w-3.5" /> None</span>}
                </td>
                <td className="px-4 py-4"><ActiveBadge active={Boolean(row.IsActive)} /></td>
                <td className="px-4 py-4">
                  <div className="flex justify-end gap-2">
                    <button className="icon-btn" type="button" onClick={() => onEdit(row)} aria-label="Edit brand" title="Edit"><Edit3 className="h-4 w-4" /></button>
                    <button className="icon-btn" type="button" onClick={() => onToggle(row)} aria-label="Toggle brand" title={row.IsActive ? 'Deactivate' : 'Activate'}><Power className="h-4 w-4" /></button>
                    <button className="icon-btn text-red-700" type="button" onClick={() => onDelete(row)} aria-label="Delete brand" title="Delete"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
