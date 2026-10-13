import { NotificationList } from './NotificationList.jsx';
export function NotificationDropdown({ items, onRead }) { return <div className="absolute right-0 top-12 z-30 w-80"><NotificationList items={items} onRead={onRead} /></div>; }
