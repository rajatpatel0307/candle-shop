import { EmptyState } from '../../../shared/components/EmptyState.jsx';
import { NotificationItem } from './NotificationItem.jsx';
export function NotificationList({ items = [], onRead }) { if (!items.length) return <EmptyState title="No notifications." />; return <section className="rounded-lg border border-stone-200 bg-white shadow-sm">{items.map((item) => <NotificationItem key={item.NotificationId} item={item} onRead={onRead} />)}</section>; }
