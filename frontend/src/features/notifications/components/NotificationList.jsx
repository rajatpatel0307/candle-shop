import { EmptyState } from '../../../shared/components/EmptyState.jsx';
import { NotificationItem } from './NotificationItem.jsx';
export function NotificationList({ items = [], onRead, emptyTitle = "No notifications." }) { if (!items.length) return <EmptyState title={emptyTitle} />; return <section className="rounded-lg border border-stone-200 bg-white shadow-sm">{items.map((item) => <NotificationItem key={item.NotificationId} item={item} onRead={onRead} />)}</section>; }
