import { Link } from 'react-router-dom';
import { notificationTarget } from '../notifications.utils.js';
export function NotificationItem({ item, onRead }) { return <article className="border-b border-stone-100 p-3 text-sm"><Link to={notificationTarget(item)} className="font-semibold">{item.Title}</Link><p className="text-stone-600">{item.Message}</p>{!item.ReadAtUtc && <button className="mt-2 text-[#8d5132] underline" onClick={() => onRead(item.NotificationId)}>Mark read</button>}</article>; }
