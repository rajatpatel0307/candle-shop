import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { MapPin, Package, UserRound, ArrowLeft, ChevronRight, Heart, Headphones, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../auth/hooks/useAuth.js';

export function CustomerAccountLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState('');
  async function signOut() {
    setLoggingOut(true); setError('');
    try { await logout(); navigate('/login', { replace: true }); }
    catch { setError('Could not sign out. Please try again.'); }
    finally { setLoggingOut(false); }
  }
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-9">
      <Link to="/shop" className="mb-6 inline-flex items-center gap-2 text-xs font-medium text-stone-500 transition hover:text-[#8d5132]"><ArrowLeft className="h-3.5 w-3.5" />Back to shopping</Link>
      <div className="grid items-start gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-8">
        <aside className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm lg:sticky lg:top-24">
          <div className="flex items-center gap-3 bg-[#392e27] p-5 text-white sm:p-6">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/20 bg-[#f1d9ba] text-lg font-semibold text-[#62432c]">{`${user?.firstName?.[0] || 'C'}${user?.lastName?.[0] || ''}`.toUpperCase()}</span>
            <div className="min-w-0"><p className="text-xs text-[#d9c8bb]">Welcome back,</p><p className="mt-1 truncate font-semibold">{user?.firstName || 'Customer'} {user?.lastName || ''}</p></div>
          </div>
          <p className="hidden px-5 pb-1 pt-5 text-[10px] font-bold uppercase tracking-[0.18em] text-stone-400 lg:block">Your account</p>
          <nav aria-label="Customer account" className="grid grid-cols-3 gap-1 p-2 lg:grid-cols-1 lg:p-3">
            {[['/account/profile', 'My profile', 'Personal information', UserRound], ['/orders', 'My orders', 'Purchases & delivery', Package], ['/account/addresses', 'My addresses', 'Saved delivery locations', MapPin]].map(([to, label, description, Icon]) => <NavLink key={to} to={to} className={({ isActive }) => `group flex flex-col items-center gap-2 rounded-xl px-2 py-3 text-xs transition lg:flex-row lg:gap-3 lg:px-3 lg:py-4 lg:text-sm ${isActive ? 'bg-[#f5ebe0] font-semibold text-[#8d5132]' : 'text-stone-500 hover:bg-stone-50 hover:text-stone-800'}`}>
              <Icon className="h-[18px] w-[18px] shrink-0" /><span className="min-w-0 lg:flex-1">{label}<span className="mt-1 hidden text-[11px] font-normal text-stone-500 lg:block">{description}</span></span><ChevronRight className="hidden h-4 w-4 opacity-50 lg:block" />
            </NavLink>)}
          </nav>
          <div className="hidden border-t border-stone-100 px-5 py-3 lg:grid">
            {[[Heart, 'My wishlist', '/wishlist'], [Headphones, 'Help & support', '/support/tickets'], [ShieldCheck, 'Account security', '/sessions']].map(([Icon, label, to]) => <Link key={to} to={to} className="flex items-center gap-3 py-3 text-sm text-stone-500 transition hover:text-[#8d5132]"><Icon className="h-4 w-4" />{label}</Link>)}
          </div>
          <div className="hidden border-t border-stone-100 p-5 lg:block"><button type="button" onClick={signOut} disabled={loggingOut} className="flex items-center gap-3 text-sm font-medium text-stone-500 hover:text-red-700 disabled:opacity-50"><LogOut className="h-4 w-4" />{loggingOut ? 'Signing out...' : 'Sign out'}</button>{error && <p role="alert" className="mt-2 text-xs text-red-700">{error}</p>}</div>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
