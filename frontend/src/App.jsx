import { ImageInput, useImageUploadState } from './shared/components/ImageInput.jsx';
import { CatalogPage } from './features/catalog/pages/CatalogPage.jsx';
import { CollectionsPage } from './features/catalog/pages/CollectionsPage.jsx';
import { useEffect, useMemo, useRef, useState } from 'react';
import { BrowserRouter, Link, Navigate, NavLink, Route, Routes, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, Bell, Boxes, ClipboardList, FileText, Flame, Headphones, Heart, LayoutDashboard, LogOut, Mail, Menu, MessageSquare, Package, Search, Settings, ShoppingBag, Sparkles, Trash2, Truck, UserRound, Users, Warehouse, X } from 'lucide-react';
import { apiClient } from './services/apiClient.js';
import { endpoints } from './services/endpoints.js';
import {
  AuthGuard,
  ForgotPasswordPage,
  LoginPage,
  RegisterPage,
  ResetPasswordPage,
  RoleGuard,
  SessionManagementPage,
  useAuth,
  VerifyEmailPage,
} from './features/auth/index.js';
import { getRoleHomePath, hasAnyRole } from './features/auth/utils/authRouting.js';
import { CartPage, useCartMutations } from './features/cart/index.js';
import { useCart } from './features/cart/hooks/useCart.js';
import { useWishlist } from './features/wishlist/hooks/useWishlist.js';
import { CheckoutPage, OrderConfirmationPage, PaymentResultPage } from './features/checkout/index.js';
import { OrderDetailsPage, OrderHistoryPage, OrderTrackingPage } from './features/orders/index.js';
import { CustomerAccountLayout } from './features/account/CustomerAccountLayout.jsx';
import { ProductDetailsPage } from './features/catalog/pages/ProductDetailsPage.jsx';
import { ProfilePage } from './features/account/ProfilePage.jsx';
import { AddressesPage } from './features/account/AddressesPage.jsx';
import { WishlistButton, WishlistPage } from './features/wishlist/index.js';
import { AdminOrderDetailsPage, AdminOrdersPage, AdminRefundsPage, AdminShipmentsPage } from './admin/orders/index.js';
import { AdminDashboardPage } from './admin/dashboard/index.js';
import { AdminProductsPage } from './admin/products/index.js';
import { AdminCategoriesPage } from './admin/categories/index.js';
import { AdminBrandsPage } from './admin/brands/index.js';
import { AdminCustomersPage, AdminCustomerDetailsPage } from './admin/customers/index.js';
import { AdminCouponsPage } from './admin/coupons/index.js';
import { AdminShippingSettingsPage } from './admin/shipping/index.js';
import { AdminSettingsPage } from './admin/settings/index.js';
import { AdminReportsPage } from './admin/reports/index.js';
import { AdminAuditLogsPage } from './admin/audit-logs/index.js';
import { MyReviews } from './features/reviews/index.js';
import { NotificationBell, NotificationsPage } from './features/notifications/index.js';
import { ContactUs } from './features/contact/index.js';
import { MyTickets, TicketDetails } from './features/support/index.js';
import { ManageReviews } from './admin/reviews/index.js';
import { ManageNotifications } from './admin/notifications/index.js';
import { ManageContactMessages } from './admin/contact/index.js';
import { AdminTicketDetails, ManageTickets } from './admin/support/index.js';
import { HomePage as DynamicHomePage } from './features/home/index.js';
import { AboutUs, ContentPage, PrivacyPolicy, TermsAndConditions } from './features/content/index.js';
import { ManageBanners } from './admin/content/index.js';
import {
  InventoryDashboard,
  InventoryDetailsPage,
  InventoryListPage,
  InventoryMovementsPage,
  InventoryReservationsPage,
  StockAdjustmentsPage,
  StockReceiptsPage,
} from './admin/inventory/index.js';

const fallbackProducts = [
  { ProductId: 'sample-1', ProductName: 'Amber Ritual Candle', Slug: 'amber-ritual-candle', ShortDescription: 'Warm amber, sandalwood, and a quiet evening glow.', SellingPrice: 1199, CompareAtPrice: 1499, CategoryName: 'Signature Candles', ImageUrl: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=900&q=80' },
  { ProductId: 'sample-2', ProductName: 'Cedar Smoke Jar', Slug: 'cedar-smoke-jar', ShortDescription: 'Cedar, clove, and clean smoke for cooler nights.', SellingPrice: 999, CategoryName: 'Wood Wick', ImageUrl: 'https://images.unsplash.com/photo-1602524206684-4b8a87c86a8b?auto=format&fit=crop&w=900&q=80' },
  { ProductId: 'sample-3', ProductName: 'Citrus Linen Tin', Slug: 'citrus-linen-tin', ShortDescription: 'Bright citrus folded into fresh linen and soft musk.', SellingPrice: 799, CategoryName: 'Travel Tins', ImageUrl: 'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?auto=format&fit=crop&w=900&q=80' },
];

const fallbackCategories = [
  { CategoryId: 1, CategoryName: 'Signature Candles', Slug: 'signature-candles', Description: 'Core candle collections for daily rituals.' },
  { CategoryId: 2, CategoryName: 'Gift Sets', Slug: 'gift-sets', Description: 'Curated bundles for celebrations and hosting.' },
  { CategoryId: 3, CategoryName: 'Accessories', Slug: 'accessories', Description: 'Trimmers, snuffers, holders, and care tools.' },
];

const adminGroups = [
  ['Dashboard', ['dashboard', 'reports', 'audit-logs', 'settings']],
  ['Catalog', ['categories', 'brands', 'products', 'product-variants', 'product-images', 'product-specifications', 'product-tags', 'product-tag-mappings']],
  ['Stock', ['inventory-dashboard', 'inventory', 'inventory-movements', 'inventory-reservations']],
  ['Orders', ['orders', 'shipments', 'refunds', 'carts', 'cart-items', 'checkout-sessions', 'order-items', 'order-addresses', 'order-status-history']],
  ['Payment', ['payments', 'payment-attempts', 'payment-webhook-events', 'coupons', 'coupon-usages', 'product-discounts']],
  ['Customers', ['customers', 'users', 'roles', 'user-roles', 'user-addresses', 'wishlists', 'wishlist-items', 'notifications']],
  ['Engagement', ['reviews', 'notifications', 'contact-messages', 'support-tickets']],
  ['Content', ['content/banners', 'shipping-settings', 'store-settings']],
];

function currency(value) {
  if (value === null || value === undefined || value === '') return 'Price pending';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(value));
}

function useApiQuery(key, url, fallback) {
  return useQuery({
    queryKey: key,
    queryFn: async () => (await apiClient.get(url)).data.data,
    retry: false,
    placeholderData: fallback,
  });
}

const primaryNav = [
  { to: '/shop', label: 'Shop' },
  { to: '/categories', label: 'Collections' },
  { to: '/about', label: 'Our story' },
  { to: '/contact', label: 'Contact' },
];

const footerSections = [
  {
    title: 'Shop',
    links: [
      { to: '/shop', label: 'All candles' },
      { to: '/categories', label: 'Collections' },
      { to: '/wishlist', label: 'Wishlist' },
      { to: '/cart', label: 'Cart' },
    ],
  },
  {
    title: 'Account',
    links: [
      { to: '/orders', label: 'Orders' },
      { to: '/notifications', label: 'Notifications' },
      { to: '/support/tickets', label: 'Support tickets' },
    ],
  },
  {
    title: 'Studio',
    links: [
      { to: '/about', label: 'About us' },
      { to: '/contact', label: 'Contact us' },
      { to: '/terms', label: 'Terms' },
      { to: '/privacy', label: 'Privacy' },
    ],
  },
];

function navClass({ isActive }) {
  return `rounded-md px-2 py-1 transition ${isActive ? 'bg-white text-[#2f2722] shadow-sm' : 'text-stone-700 hover:bg-white/70 hover:text-[#2f2722]'}`;
}

const adminNavSections = [
  {
    title: 'Overview',
    items: [
      { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'SUPPORT'] },
      { to: '/admin/reports', label: 'Reports', icon: FileText, roles: ['ADMIN', 'SUPPORT'] },
      { to: '/admin/audit-logs', label: 'Audit logs', icon: ClipboardList, roles: ['ADMIN', 'SUPPORT'] },
    ],
  },
  {
    title: 'Catalog',
    items: [
      { to: '/admin/products', label: 'Products', icon: Package, roles: ['ADMIN', 'SUPPORT'] },
      { to: '/admin/categories', label: 'Categories', icon: Boxes, roles: ['ADMIN', 'SUPPORT'] },
      { to: '/admin/brands', label: 'Brands', icon: Flame, roles: ['ADMIN', 'SUPPORT'] },
    ],
  },
  {
    title: 'Orders',
    items: [
      { to: '/admin/orders', label: 'Orders', icon: ShoppingBag, roles: ['ADMIN', 'SUPPORT'] },
      { to: '/admin/shipments', label: 'Shipments', icon: Truck, roles: ['ADMIN', 'SUPPORT'] },
      { to: '/admin/refunds', label: 'Refunds', icon: ClipboardList, roles: ['ADMIN', 'SUPPORT'] },
    ],
  },
  {
    title: 'Customers',
    items: [
      { to: '/admin/customers', label: 'Customers', icon: Users, roles: ['ADMIN', 'SUPPORT'] },
      { to: '/admin/reviews', label: 'Reviews', icon: MessageSquare, roles: ['ADMIN', 'SUPPORT'] },
      { to: '/admin/contact-messages', label: 'Messages', icon: Mail, roles: ['ADMIN', 'SUPPORT'] },
      { to: '/admin/support-tickets', label: 'Tickets', icon: Headphones, roles: ['ADMIN', 'SUPPORT'] },
      { to: '/admin/notifications', label: 'Notifications', icon: Bell, roles: ['ADMIN', 'SUPPORT'] },
    ],
  },
  {
    title: 'Content',
    items: [
      { to: '/admin/content/banners', label: 'Banners', icon: FileText, roles: ['ADMIN', 'SUPPORT'] },
      { to: '/admin/shipping-settings', label: 'Shipping settings', icon: Truck, roles: ['ADMIN', 'SUPPORT'] },
    ],
  },
  {
    title: 'Admin only',
    items: [
      { to: '/admin/inventory-dashboard', label: 'Inventory', icon: Warehouse, roles: ['ADMIN'] },
      { to: '/admin/settings', label: 'Settings', icon: Settings, roles: ['ADMIN'] },
    ],
  },
];

function AdminSidebar({ onNavigate }) {
  const { user } = useAuth();
  const [search,setSearch] = useState('');
  const sections=adminNavSections.map((section)=>({...section,items:section.items.filter((item)=>hasAnyRole(user,item.roles) && `${section.title} ${item.label}`.toLowerCase().includes(search.toLowerCase().trim()))})).filter((section)=>section.items.length);
  return <aside className="admin-sidebar flex h-full flex-col lg:sticky lg:top-0 lg:h-screen"><Link to="/admin/dashboard" onClick={onNavigate} className="admin-sidebar-brand"><span className="admin-brand-mark"><Flame className="h-6 w-6" strokeWidth={1.2}/></span><span><span className="block font-serif text-xl">Candle Studio</span><small>Store management</small></span></Link><div className="admin-sidebar-search"><label><Search className="h-4 w-4 shrink-0" strokeWidth={1.4}/><input type="search" aria-label="Search admin pages" value={search} onChange={(event)=>setSearch(event.target.value)} placeholder="Find a page..."/></label></div><nav className="admin-sidebar-nav" aria-label="Admin navigation">{sections.map((section)=><section key={section.title}><h2>{section.title}</h2><div>{section.items.map((item)=>{const Icon=item.icon;return <NavLink key={item.to} to={item.to} className={({isActive})=>`admin-nav-link ${isActive ? 'is-active':''}`} onClick={onNavigate}><Icon className="h-[17px] w-[17px] shrink-0" strokeWidth={1.4}/><span>{item.label}</span></NavLink>;})}</div></section>)}{!sections.length && <p className="px-3 text-xs leading-6 text-[#80715f]">No pages match your search.</p>}</nav><div className="admin-sidebar-footer"><Link to="/admin/profile" onClick={onNavigate} className="admin-staff-link"><span className="admin-staff-avatar">{user?.firstName?.[0] || 'A'}</span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-medium">{user?.firstName || 'Your profile'} {user?.lastName || ''}</span><small>{hasAnyRole(user,['ADMIN']) ? 'Administrator':'Support team'}</small></span><UserRound className="h-4 w-4" strokeWidth={1.3}/></Link><Link to="/" onClick={onNavigate} className="admin-store-link">View storefront<ArrowRight className="h-3.5 w-3.5"/></Link></div></aside>;
}

function AdminHeader({ onOpenMenu, menuTrigger, mobileOpen }) {
  const { user } = useAuth();
  const roleLabel=hasAnyRole(user,['ADMIN']) ? 'Administrator':'Support';
  return <header className="admin-topbar sticky top-0 z-40 border-b border-stone-200 px-4 py-4 backdrop-blur sm:px-7"><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-3"><button ref={menuTrigger} type="button" className="icon-btn lg:hidden" aria-label="Open admin menu" aria-controls="mobile-admin-menu" aria-expanded={mobileOpen} onClick={onOpenMenu}><Menu className="h-4 w-4"/></button><p className="admin-topbar-title">Candle Studio</p></div><div className="flex items-center gap-2"><span className="admin-role-tag hidden sm:inline-flex">{roleLabel}</span><NotificationBell/><AccountMenu/></div></div></header>;
}

function AdminLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileMenu = useRef(null);
  const mobileTrigger = useRef(null);
  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    mobileMenu.current?.querySelector('button')?.focus();
    const close = (event) => {
      if (event.key === 'Escape') setMobileOpen(false);
      if (event.key === 'Tab') {
        const items = [...(mobileMenu.current?.querySelectorAll('button, a, input') || [])].filter((item) => !item.disabled);
        const first = items[0]; const last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    window.addEventListener('keydown', close);
    return () => { document.body.style.overflow = previous; window.removeEventListener('keydown', close); mobileTrigger.current?.focus(); };
  }, [mobileOpen]);

  return (
    <div className="admin-workspace min-h-screen bg-[#fcf9f2] text-[#43372b] lg:grid lg:grid-cols-[250px_minmax(0,1fr)]">
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>
      <div className="lg:hidden">
        {mobileOpen && <div className="fixed inset-0 z-50"><button type="button" aria-label="Close admin menu" className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} /><div ref={mobileMenu} id="mobile-admin-menu" role="dialog" aria-modal="true" aria-label="Admin navigation" className="relative h-full w-[min(20rem,85vw)]"><button type="button" aria-label="Close menu" autoFocus onClick={() => setMobileOpen(false)} className="absolute right-3 top-4 z-10 rounded-lg p-2 text-[#796c5c] hover:bg-white/60"><X className="h-5 w-5" /></button><AdminSidebar onNavigate={() => setMobileOpen(false)} /></div></div>}
      </div>
      <div className="admin-main-column min-w-0">
        <AdminHeader onOpenMenu={() => setMobileOpen(true)} menuTrigger={mobileTrigger} mobileOpen={mobileOpen} />
        {children}
      </div>
    </div>
  );
}

function AdminRoute({ roles = ['ADMIN', 'SUPPORT'], children }) {
  return (
    <RoleGuard roles={roles}>
      <AdminLayout>{children}</AdminLayout>
    </RoleGuard>
  );
}

function StaffRedirectGuard({ children }) {
  const { user, status, loadCurrentUser } = useAuth();

  useEffect(() => {
    if (status === 'idle') loadCurrentUser();
  }, [status]);

  if (status === 'idle' || status === 'loading') return <div className="p-8 text-stone-600">Checking session...</div>;
  if (hasAnyRole(user, ['ADMIN', 'SUPPORT'])) return <Navigate to="/admin/dashboard" replace />;
  return children;
}

function CustomerRoute({ children }) {
  const { user } = useAuth();

  return (
    <AuthGuard>
      {hasAnyRole(user, ['ADMIN', 'SUPPORT']) ? <Navigate to="/admin/dashboard" replace /> : children}
    </AuthGuard>
  );
}

function AccountMenu({ onNavigate }) {
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const [open, setOpen] = useState(false);
  const { user, status, loadCurrentUser, logout } = useAuth();
  const isAuthenticated = Boolean(user);
  const isStaff = hasAnyRole(user, ['ADMIN', 'SUPPORT']);

  useEffect(() => {
    if (status === 'idle') loadCurrentUser();
  }, [status]);

  useEffect(() => {
    function handlePointerDown(event) {
      if (!menuRef.current?.contains(event.target)) setOpen(false);
    }

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  async function handleLogout() {
    await logout();
    setOpen(false);
    onNavigate?.();
    navigate('/login', { replace: true });
  }

  if (!isAuthenticated) {
    return (
      <Link to="/login" className="icon-btn" aria-label="Sign in" onClick={onNavigate}>
        <UserRound className="h-4 w-4" />
      </Link>
    );
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        className="icon-btn"
        aria-label="Account menu"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
      >
        <UserRound className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-md border border-stone-200 bg-white py-2 text-sm shadow-lg" role="menu">
          <div className="border-b border-stone-100 px-4 py-2">
            <p className="truncate font-semibold">{user.firstName || 'Account'}</p>
            <p className="truncate text-xs text-stone-500">{user.email}</p>
          </div>
          <Link
            to={isStaff ? '/admin/profile' : '/account/profile'}
            className="flex items-center gap-2 px-4 py-2 text-stone-700 transition hover:bg-stone-50 hover:text-[#8d5132]"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onNavigate?.();
            }}
          >
            <UserRound className="h-4 w-4" />
            My profile
          </Link>
          {!isStaff && [['/orders', 'My orders'], ['/account/addresses', 'My addresses']].map(([to, label]) => <Link key={to} to={to} role="menuitem" className="block px-4 py-2 text-stone-700 hover:bg-stone-50" onClick={() => { setOpen(false); onNavigate?.(); }}>{label}</Link>)}
          <button
            type="button"
            className="flex w-full items-center gap-2 px-4 py-2 text-left font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            role="menuitem"
            disabled={status === 'loading'}
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

function HeaderCountLink({ to, label, icon: Icon, count, pending, error, className = '' }) {
  const countLabel = pending ? 'Loading count' : error ? 'Count unavailable' : `${count} items`;
  return (
    <Link to={to} className={`icon-btn relative ${className}`} aria-label={`${label}, ${countLabel}`} title={`${label}: ${countLabel}`}>
      <Icon className="h-4 w-4" />
      {(pending || error || count > 0) && <span aria-live="polite" aria-atomic="true" className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#8d5132] px-1 text-[10px] font-bold leading-none text-white ring-2 ring-[#f7f2ea]">
        {pending ? '\u2026' : error ? '?' : count}
      </span>}
    </Link>
  );
}

function Shell({ children }) {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const cart = useCart();
  const wishlist = useWishlist();
  const cartCount = isAuthenticated ? Number(cart.data?.summary?.totalQuantity || 0) : 0;
  const wishlistCount = isAuthenticated ? Number(wishlist.data?.summary?.totalItems || 0) : 0;

  return (
    <div className={`customer-ui storefront-shell min-h-screen bg-[#fcf9f2] text-[#43372b] ${pathname === '/' ? 'home-storefront' : ''}`}>
      <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-[#f7f2ea]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link to="/" className="flex min-w-fit items-center gap-2 text-lg font-semibold" onClick={() => setMenuOpen(false)}>
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#2f2722] text-white"><Flame className="h-5 w-5 text-[#f0c28d]" /></span>
            <span>Candle Studio</span>
          </Link>
          <nav className="hidden items-center gap-1 text-sm font-semibold md:flex" aria-label="Primary navigation">
            {primaryNav.map((item) => <NavLink key={item.to} to={item.to} className={navClass}>{item.label}</NavLink>)}
          </nav>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <HeaderCountLink to="/wishlist" label="Wishlist" icon={Heart} count={wishlistCount} pending={isAuthenticated && wishlist.isPending} error={isAuthenticated && wishlist.isError && !wishlist.data} className="hidden sm:inline-flex" />
            <AccountMenu onNavigate={() => setMenuOpen(false)} />
            <HeaderCountLink to="/cart" label="Cart" icon={ShoppingBag} count={cartCount} pending={isAuthenticated && cart.isPending} error={isAuthenticated && cart.isError && !cart.data} />
            <button className="icon-btn md:hidden" type="button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
              {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav className="border-t border-stone-200 bg-[#f7f2ea] px-4 py-3 text-sm font-semibold md:hidden" aria-label="Mobile navigation">
            <div className="mx-auto grid max-w-7xl gap-1">
              {[...primaryNav, { to: '/wishlist', label: `Wishlist (${isAuthenticated && wishlist.isPending ? '\u2026' : isAuthenticated && wishlist.isError && !wishlist.data ? '?' : wishlistCount})` }, { to: '/orders', label: 'Orders' }, { to: '/support/tickets', label: 'Support' }].map((item) => (
                <NavLink key={item.to} to={item.to} className={navClass} onClick={() => setMenuOpen(false)}>{item.label}</NavLink>
              ))}
            </div>
          </nav>
        )}
      </header>
      {children}
      <footer className="border-t border-stone-200 bg-[#efe6d8] px-4 py-10 text-sm text-stone-700 sm:px-6">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.1fr_1.6fr] lg:items-start">
          <section>
            <Link to="/" className="flex items-center gap-2 text-lg font-semibold text-[#2f2722]">
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#2f2722] text-white"><Flame className="h-5 w-5 text-[#f0c28d]" /></span>
              Candle Studio
            </Link>
            <p className="mt-4 max-w-sm leading-6 text-stone-600">A little light for everyday living. Discover candles, thoughtful gifts, and moments that make a house feel like home.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link to="/shop" className="btn-primary px-4 py-2">Shop candles</Link>
              <Link to="/contact" className="btn-secondary px-4 py-2">Contact support</Link>
            </div>
          </section>
          <div className="grid gap-8 sm:grid-cols-3 lg:justify-items-end">
            {footerSections.map((section) => (
              <section key={section.title} className="min-w-32">
                <h2 className="font-semibold text-[#2f2722]">{section.title}</h2>
                <ul className="mt-3 grid gap-2.5">
                  {section.links.map((link) => <li key={link.to}><Link className="text-stone-600 transition hover:text-[#8d5132]" to={link.to}>{link.label}</Link></li>)}
                </ul>
              </section>
            ))}
          </div>
        </div>
        <div className="mx-auto mt-8 flex max-w-7xl flex-col gap-2 border-t border-stone-300 pt-5 text-xs text-stone-500 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Candle Studio. All rights reserved.</p>
          <p>A little light. A softer moment.</p>
        </div>
      </footer>
    </div>
  );
}

function ProductCard({ product }) {
  return (
    <Link to={`/products/${product.Slug}`} className="group overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="aspect-[4/3] bg-stone-100">
        {product.ImageUrl ? <img src={product.ImageUrl} alt={product.ProductName} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center"><Flame className="h-10 w-10 text-[#b56b45]" /></div>}
      </div>
      <div className="space-y-2 p-4">
        <p className="text-xs uppercase text-[#697565]">{product.CategoryName || 'Candle'}</p>
        <h3 className="text-lg font-semibold leading-snug">{product.ProductName}</h3>
        <p className="line-clamp-2 min-h-10 text-sm text-stone-600">{product.ShortDescription}</p>
        <div className="flex items-center justify-between pt-2">
          <span className="font-semibold">{currency(product.SellingPrice)}</span>
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}

function HomePage() {
  const { data, isError } = useApiQuery(['home'], endpoints.home, { categories: fallbackCategories, featuredProducts: fallbackProducts, banners: [] });
  const products = data?.featuredProducts?.length ? data.featuredProducts : fallbackProducts;
  const categories = data?.categories?.length ? data.categories : fallbackCategories;

  return (
    <Shell>
      <main>
        <section className="relative min-h-[78vh] overflow-hidden bg-stone-900 text-white">
          <img src="https://images.unsplash.com/photo-1605651202774-7d573fd3f12d?auto=format&fit=crop&w=1800&q=80" alt="Lit candles on a table" className="absolute inset-0 h-full w-full object-cover opacity-60" />
          <div className="relative mx-auto flex min-h-[78vh] max-w-7xl flex-col justify-end px-4 pb-16 pt-24 sm:px-6">
            <p className="mb-3 flex items-center gap-2 text-sm font-medium uppercase"><Sparkles className="h-4 w-4" /> Scented candles, gifts, and care essentials</p>
            <h1 className="max-w-3xl text-5xl font-semibold leading-tight md:text-7xl">Candle Studio</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-100">A complete e-commerce storefront mapped to your MSSQL candle database: catalog, cart, checkout, orders, support, content, and admin operations.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/shop" className="btn-primary">Shop collection</Link>
              <Link to="/admin" className="btn-secondary">Manage store</Link>
            </div>
            {isError && <p className="mt-5 max-w-xl text-sm text-amber-100">Showing sample content until the backend database connection is configured.</p>}
          </div>
        </section>
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase text-[#697565]">Shop by collection</p>
              <h2 className="text-3xl font-semibold">Categories</h2>
            </div>
            <Link to="/categories" className="text-sm font-semibold text-[#8d5132]">View all</Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {categories.slice(0, 3).map((category) => (
              <Link key={category.CategoryId || category.Slug} to={`/shop?category=${category.Slug}`} className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
                <Boxes className="mb-6 h-6 w-6 text-[#b56b45]" />
                <h3 className="text-xl font-semibold">{category.CategoryName}</h3>
                <p className="mt-2 text-sm leading-6 text-stone-600">{category.Description}</p>
              </Link>
            ))}
          </div>
        </section>
        <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase text-[#697565]">Featured</p>
              <h2 className="text-3xl font-semibold">Ready to light</h2>
            </div>
            <Link to="/shop" className="text-sm font-semibold text-[#8d5132]">Shop all</Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.slice(0, 6).map((product) => <ProductCard key={product.ProductId} product={product} />)}
          </div>
        </section>
      </main>
    </Shell>
  );
}

function ShopPage() { return <Shell><CatalogPage /></Shell>; }

function ProductPage() {
  return <Shell><ProductDetailsPage /></Shell>;
}

function CategoriesPage() { return <Shell><CollectionsPage /></Shell>; }

function SimplePage({ title, children }) {
  return (
    <Shell>
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <h1 className="text-4xl font-semibold">{title}</h1>
        <div className="mt-6 rounded-lg border border-stone-200 bg-white p-6 shadow-sm">{children}</div>
      </main>
    </Shell>
  );
}

function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const mutation = useMutation({ mutationFn: async () => (await apiClient.post(endpoints.contact, form)).data.data });
  return (
    <SimplePage title="Contact support">
      <form className="grid gap-4" onSubmit={(event) => { event.preventDefault(); mutation.mutate(); }}>
        {['name', 'email', 'subject'].map((field) => <input key={field} className="input" placeholder={field} value={form[field]} onChange={(event) => setForm({ ...form, [field]: event.target.value })} />)}
        <textarea className="input min-h-36" placeholder="message" value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} />
        <button className="btn-primary w-fit" disabled={mutation.isPending}>Send message</button>
        {mutation.isSuccess && <p className="text-sm text-green-700">Message created in ContactMessages.</p>}
        {mutation.isError && <p className="text-sm text-red-700">Could not send yet. Check backend and database settings.</p>}
      </form>
    </SimplePage>
  );
}

function AdminPage() {
  const { data } = useApiQuery(['admin-resources'], endpoints.adminResources, []);
  const resources = data || [];
  const byKey = Object.fromEntries(resources.map((resource) => [resource.key, resource]));

  return (
    <Shell>
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-8 flex items-center gap-3">
          <LayoutDashboard className="h-8 w-8 text-[#b56b45]" />
          <div>
            <p className="text-sm font-semibold uppercase text-[#697565]">Schema control</p>
            <h1 className="text-4xl font-semibold">Admin dashboard</h1>
          </div>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          {adminGroups.map(([group, keys]) => (
            <section key={group} className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-semibold">{group}</h2>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {keys.map((key) => (
                  <Link key={key} to={`/admin/${key}`} className="rounded-md border border-stone-200 px-3 py-2 text-sm font-medium hover:border-[#b56b45]">
                    {byKey[key]?.title || key}
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </Shell>
  );
}

function AdminResourcePage() {
  const {imageBusy,onImageBusy}=useImageUploadState();
  const { resourceKey } = useParams();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState({});
  const { data: resources } = useApiQuery(['admin-resources'], endpoints.adminResources, []);
  const resource = resources?.find((item) => item.key === resourceKey);
  const { data: rows, isError } = useApiQuery(['admin-resource', resourceKey], endpoints.adminResource(resourceKey), []);
  const mutation = useMutation({
    mutationFn: async () => (await apiClient.post(endpoints.adminResource(resourceKey), draft)).data.data,
    onSuccess: () => {
      setDraft({});
      queryClient.invalidateQueries({ queryKey: ['admin-resource', resourceKey] });
    },
  });
  const deleteMutation = useMutation({
    mutationFn: async (id) => apiClient.delete(endpoints.adminResourceRow(resourceKey, id)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-resource', resourceKey] }),
  });
  const idColumns = useMemo(() => Array.isArray(resource?.id) ? resource.id : [resource?.id].filter(Boolean), [resource]);
  const getId = (row) => idColumns.map((column) => row[column]).join(',');

  if (!resource) return <SimplePage title="Admin resource"><p className="text-stone-600">Loading resource metadata.</p></SimplePage>;

  return (
    <Shell>
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <Link to="/admin" className="text-sm font-semibold text-[#8d5132]">Back to dashboard</Link>
        <h1 className="mt-3 text-4xl font-semibold">{resource.title}</h1>
        {isError && <p className="mt-3 text-sm text-red-700">Could not load records. Confirm MSSQL and backend env values.</p>}
        <section className="mt-8 rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold">Create record</h2>
          <form className="mt-4 grid gap-3 md:grid-cols-3" onSubmit={(event) => { event.preventDefault(); if(!imageBusy)mutation.mutate(); }}>
            {resource.write.map((field) => (
              <div key={field} className="grid gap-1 text-sm font-medium text-stone-700">
                {field}
                {/imageurl$|logourl$/i.test(field) ? <ImageInput label={field} value={draft[field]||''} onChange={value=>setDraft(current=>({...current,[field]:value}))} onBusyChange={busy=>onImageBusy(field,busy)}/> : <input className="input" value={draft[field] ?? ''} onChange={(event) => setDraft({ ...draft, [field]: event.target.value })} />}
              </div>
            ))}
            <button className="btn-primary mt-auto w-fit md:col-span-3" disabled={mutation.isPending || imageBusy}>Create</button>
          </form>
        </section>
        <section className="mt-8 overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-stone-100 text-xs uppercase text-stone-600">
                <tr>{[...idColumns, ...resource.list].filter((value, index, list) => list.indexOf(value) === index).map((column) => <th key={column} className="px-4 py-3">{column}</th>)}<th className="px-4 py-3">Actions</th></tr>
              </thead>
              <tbody>
                {(rows || []).map((row) => (
                  <tr key={getId(row)} className="border-t border-stone-100">
                    {[...idColumns, ...resource.list].filter((value, index, list) => list.indexOf(value) === index).map((column) => <td key={column} className="max-w-64 truncate px-4 py-3">{String(row[column] ?? '')}</td>)}
                    <td className="px-4 py-3"><button className="icon-btn" aria-label="Delete" onClick={() => deleteMutation.mutate(getId(row))}><Trash2 className="h-4 w-4" /></button></td>
                  </tr>
                ))}
                {(!rows || rows.length === 0) && <tr><td className="px-4 py-6 text-stone-500" colSpan={resource.list.length + idColumns.length + 1}>No records found.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </Shell>
  );
}

function formatProfileDate(value) {
  if (!value) return 'Not available';
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function AdminProfilePage() {
  const { user } = useAuth();
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Admin user';
  const accessRoles = (user?.roles || []).filter((role) => ['ADMIN', 'SUPPORT'].includes(String(role).trim().toUpperCase()));
  const details = [
    ['User ID', user?.id],
    ['Email', user?.email],
    ['Phone', user?.phoneNumber || 'Not added'],
    ['Account status', user?.accountStatus || 'Unknown'],
    ['Email verified', user?.isEmailVerified ? 'Yes' : 'No'],
    ['Last login', formatProfileDate(user?.lastLoginAtUtc)],
  ];

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <section className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-md bg-[#2f2722] text-2xl font-semibold text-white">
            {fullName.slice(0, 1).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold uppercase text-[#8d5132]">Admin profile</p>
            <h2 className="text-3xl font-semibold">{fullName}</h2>
            <p className="mt-1 text-stone-600">{user?.email}</p>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-semibold">Account details</h3>
          <dl className="mt-5 grid gap-4">
            {details.map(([label, value]) => (
              <div key={label} className="grid gap-1 border-b border-stone-100 pb-3 last:border-0 last:pb-0 sm:grid-cols-[10rem_1fr]">
                <dt className="text-sm font-semibold text-stone-500">{label}</dt>
                <dd className="break-words text-sm text-[#2f2722]">{value || 'Not available'}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-semibold">Roles and access</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {accessRoles.map((role) => (
              <span key={role} className="rounded-full bg-[#efe6d8] px-3 py-1 text-sm font-semibold text-[#8d5132]">{role}</span>
            ))}
            {accessRoles.length === 0 && <span className="text-sm text-stone-600">No admin access role assigned.</span>}
          </div>
          <p className="mt-5 text-sm leading-6 text-stone-600">
            This profile controls access to the admin workspace. Customer-only accounts are visible from Customers and Customer Details, while admin/support accounts stay in admin pages.
          </p>
        </div>
      </section>
    </main>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<StaffRedirectGuard><Shell><DynamicHomePage /></Shell></StaffRedirectGuard>} />
      <Route path="/shop" element={<StaffRedirectGuard><ShopPage /></StaffRedirectGuard>} />
      <Route path="/products/:slug" element={<StaffRedirectGuard><ProductPage /></StaffRedirectGuard>} />
      <Route path="/categories" element={<StaffRedirectGuard><CategoriesPage /></StaffRedirectGuard>} />
      <Route path="/about" element={<StaffRedirectGuard><Shell><AboutUs /></Shell></StaffRedirectGuard>} />
      <Route path="/contact" element={<StaffRedirectGuard><Shell><ContactUs /></Shell></StaffRedirectGuard>} />
      <Route path="/terms" element={<StaffRedirectGuard><Shell><TermsAndConditions /></Shell></StaffRedirectGuard>} />
      <Route path="/privacy" element={<StaffRedirectGuard><Shell><PrivacyPolicy /></Shell></StaffRedirectGuard>} />
      <Route path="/pages/:slug" element={<StaffRedirectGuard><Shell><ContentPage /></Shell></StaffRedirectGuard>} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/sessions" element={<CustomerRoute><Shell><CustomerAccountLayout><SessionManagementPage /></CustomerAccountLayout></Shell></CustomerRoute>} />
      <Route path="/account" element={<Navigate to="/account/profile" replace />} />
      <Route path="/account/profile" element={<CustomerRoute><Shell><CustomerAccountLayout><ProfilePage /></CustomerAccountLayout></Shell></CustomerRoute>} />
      <Route path="/account/addresses" element={<CustomerRoute><Shell><CustomerAccountLayout><AddressesPage /></CustomerAccountLayout></Shell></CustomerRoute>} />
      <Route path="/addresses" element={<Navigate to="/account/addresses" replace />} />
      <Route path="/account/orders" element={<Navigate to="/orders" replace />} />
      <Route path="/notifications" element={<CustomerRoute><Shell><CustomerAccountLayout><NotificationsPage /></CustomerAccountLayout></Shell></CustomerRoute>} />
      <Route path="/account/reviews" element={<CustomerRoute><Shell><CustomerAccountLayout><MyReviews /></CustomerAccountLayout></Shell></CustomerRoute>} />
      <Route path="/support/tickets" element={<CustomerRoute><Shell><CustomerAccountLayout><MyTickets /></CustomerAccountLayout></Shell></CustomerRoute>} />
      <Route path="/support/tickets/:ticketId" element={<CustomerRoute><Shell><CustomerAccountLayout><TicketDetails /></CustomerAccountLayout></Shell></CustomerRoute>} />
      <Route path="/cart" element={<CustomerRoute><Shell><CartPage /></Shell></CustomerRoute>} />
      <Route path="/checkout" element={<CustomerRoute><CheckoutPage /></CustomerRoute>} />
      <Route path="/payments/result" element={<CustomerRoute><Shell><PaymentResultPage /></Shell></CustomerRoute>} />
      <Route path="/orders/:orderId/confirmation" element={<CustomerRoute><Shell><OrderConfirmationPage /></Shell></CustomerRoute>} />
      <Route path="/orders" element={<CustomerRoute><Shell><CustomerAccountLayout><OrderHistoryPage /></CustomerAccountLayout></Shell></CustomerRoute>} />
      <Route path="/orders/:orderId" element={<CustomerRoute><Shell><CustomerAccountLayout><OrderDetailsPage /></CustomerAccountLayout></Shell></CustomerRoute>} />
      <Route path="/orders/:orderId/tracking" element={<CustomerRoute><Shell><CustomerAccountLayout><OrderTrackingPage /></CustomerAccountLayout></Shell></CustomerRoute>} />
      <Route path="/wishlist" element={<CustomerRoute><Shell><CustomerAccountLayout><WishlistPage /></CustomerAccountLayout></Shell></CustomerRoute>} />
      <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
      <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
      <Route path="/admin/profile" element={<AdminRoute><AdminProfilePage /></AdminRoute>} />
      <Route path="/admin/products" element={<AdminRoute><AdminProductsPage /></AdminRoute>} />
      <Route path="/admin/categories" element={<AdminRoute><AdminCategoriesPage /></AdminRoute>} />
      <Route path="/admin/brands" element={<AdminRoute><AdminBrandsPage /></AdminRoute>} />
      <Route path="/admin/customers" element={<AdminRoute><AdminCustomersPage /></AdminRoute>} />
      <Route path="/admin/customers/:customerId" element={<AdminRoute><AdminCustomerDetailsPage /></AdminRoute>} />
      <Route path="/admin/coupons" element={<AdminRoute><AdminCouponsPage /></AdminRoute>} />
      <Route path="/admin/shipping-settings" element={<AdminRoute><AdminShippingSettingsPage /></AdminRoute>} />
      <Route path="/admin/settings" element={<AdminRoute roles={['ADMIN']}><AdminSettingsPage /></AdminRoute>} />
      <Route path="/admin/reports" element={<AdminRoute><AdminReportsPage /></AdminRoute>} />
      <Route path="/admin/audit-logs" element={<AdminRoute><AdminAuditLogsPage /></AdminRoute>} />
      <Route path="/admin/reviews" element={<AdminRoute><ManageReviews /></AdminRoute>} />
      <Route path="/admin/notifications" element={<AdminRoute><ManageNotifications /></AdminRoute>} />
      <Route path="/admin/contact-messages" element={<AdminRoute><ManageContactMessages /></AdminRoute>} />
      <Route path="/admin/support-tickets" element={<AdminRoute><ManageTickets /></AdminRoute>} />
      <Route path="/admin/support/tickets/:ticketId" element={<AdminRoute><AdminTicketDetails /></AdminRoute>} />
      <Route path="/admin/content/banners" element={<AdminRoute><ManageBanners /></AdminRoute>} />
      <Route path="/admin/resources" element={<AdminRoute roles={['ADMIN']}><AdminPage /></AdminRoute>} />
      <Route path="/admin/orders" element={<AdminRoute><AdminOrdersPage /></AdminRoute>} />
      <Route path="/admin/orders/:orderId" element={<AdminRoute><AdminOrderDetailsPage /></AdminRoute>} />
      <Route path="/admin/shipments" element={<AdminRoute><AdminShipmentsPage /></AdminRoute>} />
      <Route path="/admin/refunds" element={<AdminRoute><AdminRefundsPage /></AdminRoute>} />
      <Route path="/admin/inventory-dashboard" element={<AdminRoute roles={['ADMIN']}><InventoryDashboard /></AdminRoute>} />
      <Route path="/admin/inventory" element={<AdminRoute roles={['ADMIN']}><InventoryListPage /></AdminRoute>} />
      <Route path="/admin/inventory/:productVariantId" element={<AdminRoute roles={['ADMIN']}><InventoryDetailsPage /></AdminRoute>} />
      <Route path="/admin/inventory/:productVariantId/receipts" element={<AdminRoute roles={['ADMIN']}><StockReceiptsPage /></AdminRoute>} />
      <Route path="/admin/inventory/:productVariantId/adjustments" element={<AdminRoute roles={['ADMIN']}><StockAdjustmentsPage /></AdminRoute>} />
      <Route path="/admin/inventory-movements" element={<AdminRoute roles={['ADMIN']}><InventoryMovementsPage /></AdminRoute>} />
      <Route path="/admin/inventory-reservations" element={<AdminRoute roles={['ADMIN']}><InventoryReservationsPage /></AdminRoute>} />
      <Route path="/admin/:resourceKey" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="*" element={<SimplePage title="Page not found"><Link className="text-[#8d5132] underline" to="/">Return home</Link></SimplePage>} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
