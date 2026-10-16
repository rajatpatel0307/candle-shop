import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { MapPin, Package, UserRound, ArrowLeft, ChevronRight, Heart, Headphones, LogOut, ShieldCheck, Star, Bell } from 'lucide-react';
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
  const navigation = [
    ['/account/profile','My profile','The details that make you, you',UserRound],
    ['/orders','My orders','Purchases and deliveries',Package],
    ['/account/addresses','My addresses','Your favourite destinations',MapPin],
    ['/wishlist','My wishlist','Lovely things, saved for later',Heart],
    ['/account/reviews','My reviews','Your thoughts on the collection',Star],
    ['/notifications','Updates','The latest on your account',Bell],
    ['/support/tickets','Help & support','A little help when you need it',Headphones],
    ['/sessions','Account security','Where you are signed in',ShieldCheck],
  ];
  return <div className="customer-account customer-page-width"><Link to="/shop" className="mb-8 inline-flex items-center gap-2 text-xs text-[#796c5c]"><ArrowLeft className="h-3.5 w-3.5"/>Back to the collection</Link><div className="grid items-start gap-8 lg:grid-cols-[235px_minmax(0,1fr)] lg:gap-12"><aside className="customer-account-sidebar lg:sticky lg:top-28"><div className="customer-account-identity"><span className="customer-account-avatar">{`${user?.firstName?.[0] || 'C'}${user?.lastName?.[0] || ''}`.toUpperCase()}</span><div className="min-w-0"><p className="home-eyebrow text-[9px]">Your own little corner</p><p className="mt-2 truncate font-serif text-xl">{user?.firstName || 'Your account'} {user?.lastName || ''}</p></div></div><nav className="customer-account-nav" aria-label="Customer account">{navigation.map(([to,label,description,Icon])=><NavLink key={to} to={to} className={({isActive})=>`customer-account-link ${isActive ? 'is-active':''}`}><Icon className="h-4 w-4 shrink-0" strokeWidth={1.4}/><span>{label}<small>{description}</small></span><ChevronRight className="ml-auto hidden h-3.5 w-3.5 lg:block"/></NavLink>)}</nav><div className="mt-5 border-t border-[#e4dacd] pt-5"><button type="button" onClick={signOut} disabled={loggingOut} className="flex items-center gap-3 text-xs text-[#796c5c] hover:text-red-700 disabled:opacity-50"><LogOut className="h-4 w-4"/>{loggingOut ? 'Signing out...':'Sign out'}</button>{error && <p role="alert" className="mt-2 text-xs text-red-700">{error}</p>}</div></aside><div className="customer-account-content min-w-0">{children}</div></div></div>;
}
