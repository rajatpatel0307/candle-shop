import { ArrowUpRight, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../features/auth/hooks/useAuth.js';
export function LowStockWidget({items=[]}) {
 const {hasRole}=useAuth();
 return <section className="admin-widget"><div className="admin-widget-heading"><div><h2>Stock watch</h2><p className="mt-2 text-[10px] text-stone-500">Products below their reorder level</p></div>{hasRole('ADMIN') && <Link to="/admin/inventory">Inventory <ArrowUpRight size={13}/></Link>}</div>{!items.length ? <p className="admin-widget-empty">No low-stock products to display.</p>:<ul className="admin-widget-list">{items.slice(0,6).map(item=><li key={item.ProductVariantId}><span className="admin-list-icon"><Package size={17} strokeWidth={1.2}/></span><div className="min-w-0 flex-1"><p className="truncate font-medium">{item.ProductName}</p><p className="mt-1 text-[10px] text-stone-500">{item.SKU}</p></div><span className={`admin-stock-count ${Number(item.AvailableQuantity)<=0 ? 'is-empty':''}`}>{item.AvailableQuantity} left</span></li>)}</ul>}</section>;
}
