import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDate } from '../../../features/orders/utils/ordersHelpers.js';
export function RecentActivityFeed({activity=[]}) {
 return <section className="admin-widget"><div className="admin-widget-heading"><h2>Studio activity</h2><Link to="/admin/audit-logs">View all <ArrowUpRight size={13}/></Link></div>{!activity.length ? <p className="admin-widget-empty">Store activity will appear here.</p>:<ul className="admin-activity-list">{activity.slice(0,5).map(item=><li key={item.AuditLogId}><span className="admin-activity-dot"/><div><p className="text-xs font-medium">{item.ActionName?.replaceAll('_',' ')}</p><p className="mt-1 text-[10px] text-stone-500">{item.EntityName} <span className="mx-1">/</span> {formatDate(item.CreatedAtUtc)}</p></div></li>)}</ul>}</section>;
}
