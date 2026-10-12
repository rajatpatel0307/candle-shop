import { useMemo, useState } from 'react';
import { BrowserRouter, Link, NavLink, Route, Routes, useParams, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, Boxes, Flame, Heart, LayoutDashboard, Package, Search, ShoppingBag, Sparkles, Trash2, UserRound } from 'lucide-react';
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
  VerifyEmailPage,
} from './features/auth/index.js';
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
  ['Catalog', ['categories', 'brands', 'fragrances', 'products', 'product-variants', 'product-images', 'product-specifications', 'product-tags', 'product-tag-mappings']],
  ['Stock', ['inventory-dashboard', 'inventory', 'inventory-movements', 'inventory-reservations']],
  ['Orders', ['carts', 'cart-items', 'checkout-sessions', 'orders', 'order-items', 'order-addresses', 'order-status-history']],
  ['Payment', ['payments', 'payment-attempts', 'payment-webhook-events', 'refunds', 'coupons', 'coupon-usages', 'product-discounts']],
  ['Customers', ['users', 'roles', 'user-roles', 'user-addresses', 'wishlists', 'wishlist-items', 'notifications']],
  ['Content', ['banners', 'pages', 'product-reviews', 'review-images', 'contact-messages', 'support-tickets', 'shipping-methods', 'shipping-zones', 'shipping-rates', 'shipments', 'shipment-tracking-events', 'store-settings', 'audit-logs']],
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

function Shell({ children }) {
  return (
    <div className="min-h-screen bg-[#f7f2ea] text-[#2f2722]">
      <header className="sticky top-0 z-20 border-b border-stone-200/80 bg-[#f7f2ea]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 text-lg font-semibold">
            <Flame className="h-5 w-5 text-[#b56b45]" /> Candle Studio
          </Link>
          <nav className="hidden items-center gap-5 text-sm font-medium text-stone-700 md:flex">
            <NavLink to="/shop">Shop</NavLink>
            <NavLink to="/categories">Categories</NavLink>
            <NavLink to="/wishlist">Wishlist</NavLink>
            <NavLink to="/orders">Orders</NavLink>
            <NavLink to="/admin">Admin</NavLink>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/account" className="icon-btn" aria-label="Account"><UserRound className="h-4 w-4" /></Link>
            <Link to="/cart" className="icon-btn" aria-label="Cart"><ShoppingBag className="h-4 w-4" /></Link>
          </div>
        </div>
      </header>
      {children}
      <footer className="border-t border-stone-200 px-4 py-8 text-center text-sm text-stone-500">
        Candle e-commerce baseline for React, Vite, Tailwind, Node, Express, and MSSQL.
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

function ShopPage() {
  const [params, setParams] = useSearchParams();
  const search = params.get('search') || '';
  const category = params.get('category') || '';
  const query = new URLSearchParams({ ...(search ? { search } : {}), ...(category ? { category } : {}) }).toString();
  const { data, isError } = useApiQuery(['products', search, category], `${endpoints.products}${query ? `?${query}` : ''}`, fallbackProducts);
  const products = data?.length ? data : fallbackProducts;

  return (
    <Shell>
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-8 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase text-[#697565]">Catalog</p>
            <h1 className="text-4xl font-semibold">Shop candles</h1>
            {isError && <p className="mt-2 text-sm text-stone-600">Showing sample products until the API is connected.</p>}
          </div>
          <label className="flex min-w-72 items-center gap-2 rounded-lg border border-stone-300 bg-white px-3 py-2">
            <Search className="h-4 w-4 text-stone-500" />
            <input value={search} onChange={(event) => setParams({ ...(event.target.value ? { search: event.target.value } : {}), ...(category ? { category } : {}) })} className="w-full bg-transparent outline-none" placeholder="Search catalog" />
          </label>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => <ProductCard key={product.ProductId} product={product} />)}
        </div>
      </main>
    </Shell>
  );
}

function ProductPage() {
  const { slug } = useParams();
  const fallback = fallbackProducts.find((product) => product.Slug === slug) || fallbackProducts[0];
  const { data: product, isError } = useApiQuery(['product', slug], endpoints.product(slug), { ...fallback, variants: [], images: [{ ImageUrl: fallback.ImageUrl, AltText: fallback.ProductName }], specifications: [], reviews: [] });

  return (
    <Shell>
      <main className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-2">
        <div className="overflow-hidden rounded-lg bg-white shadow-sm">
          {product?.images?.[0]?.ImageUrl || product?.ImageUrl ? <img src={product.images?.[0]?.ImageUrl || product.ImageUrl} alt={product.ProductName} className="aspect-[4/3] w-full object-cover" /> : <div className="flex aspect-[4/3] items-center justify-center"><Package className="h-16 w-16 text-stone-400" /></div>}
        </div>
        <section>
          <p className="text-sm font-semibold uppercase text-[#697565]">{product?.CategoryName || 'Candle'}</p>
          <h1 className="mt-2 text-4xl font-semibold">{product?.ProductName}</h1>
          <p className="mt-4 text-lg leading-8 text-stone-600">{product?.ShortDescription || product?.Description}</p>
          <p className="mt-6 text-2xl font-semibold">{currency(product?.variants?.[0]?.SellingPrice || product?.SellingPrice)}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/cart" className="btn-primary">Add to cart</Link>
            <Link to="/wishlist" className="btn-secondary"><Heart className="h-4 w-4" /> Wishlist</Link>
          </div>
          {isError && <p className="mt-4 text-sm text-stone-600">Sample detail shown until this product exists in MSSQL.</p>}
          <div className="mt-8 grid gap-3">
            {(product?.variants || []).map((variant) => (
              <div key={variant.ProductVariantId} className="rounded-lg border border-stone-200 bg-white p-4">
                <div className="flex justify-between gap-4"><strong>{variant.VariantName}</strong><span>{currency(variant.SellingPrice)}</span></div>
                <p className="mt-1 text-sm text-stone-600">{variant.FragranceName || variant.SKU}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </Shell>
  );
}

function CategoriesPage() {
  const { data } = useApiQuery(['categories'], endpoints.categories, fallbackCategories);
  const categories = data?.length ? data : fallbackCategories;
  return (
    <Shell>
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <h1 className="text-4xl font-semibold">Categories</h1>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {categories.map((category) => (
            <Link key={category.CategoryId || category.Slug} to={`/shop?category=${category.Slug}`} className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-semibold">{category.CategoryName}</h2>
              <p className="mt-2 text-sm leading-6 text-stone-600">{category.Description}</p>
            </Link>
          ))}
        </div>
      </main>
    </Shell>
  );
}

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
          <form className="mt-4 grid gap-3 md:grid-cols-3" onSubmit={(event) => { event.preventDefault(); mutation.mutate(); }}>
            {resource.write.map((field) => (
              <label key={field} className="grid gap-1 text-sm font-medium text-stone-700">
                {field}
                <input className="input" value={draft[field] ?? ''} onChange={(event) => setDraft({ ...draft, [field]: event.target.value })} />
              </label>
            ))}
            <button className="btn-primary mt-auto w-fit md:col-span-3" disabled={mutation.isPending}>Create</button>
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

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/shop" element={<ShopPage />} />
      <Route path="/products/:slug" element={<ProductPage />} />
      <Route path="/categories" element={<CategoriesPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/sessions" element={<AuthGuard><SessionManagementPage /></AuthGuard>} />
      <Route path="/account" element={<AuthGuard><SimplePage title="Account"><p>Profile, addresses, wishlist, notifications, and support tickets are backed by Users, UserAddresses, Wishlists, Notifications, and SupportTickets.</p><Link className="mt-4 inline-block text-[#8d5132] underline" to="/sessions">Manage sessions</Link></SimplePage></AuthGuard>} />
      <Route path="/cart" element={<SimplePage title="Cart"><p>Cart and item records map to Carts and CartItems. Add product selection logic when payment and shipping providers are configured.</p></SimplePage>} />
      <Route path="/checkout" element={<SimplePage title="Checkout"><p>Checkout sessions, order creation, order addresses, inventory reservations, payments, and shipping rates are represented in the backend baseline.</p></SimplePage>} />
      <Route path="/orders" element={<SimplePage title="Orders"><p>Customer order history maps to Orders, OrderItems, Shipments, and ShipmentTrackingEvents.</p></SimplePage>} />
      <Route path="/wishlist" element={<SimplePage title="Wishlist"><p>Wishlist and WishlistItems are available in the admin data layer.</p></SimplePage>} />
      <Route path="/admin" element={<RoleGuard roles={['ADMIN']}><AdminPage /></RoleGuard>} />
      <Route path="/admin/inventory-dashboard" element={<RoleGuard roles={['ADMIN']}><InventoryDashboard /></RoleGuard>} />
      <Route path="/admin/inventory" element={<RoleGuard roles={['ADMIN']}><InventoryListPage /></RoleGuard>} />
      <Route path="/admin/inventory/:productVariantId" element={<RoleGuard roles={['ADMIN']}><InventoryDetailsPage /></RoleGuard>} />
      <Route path="/admin/inventory/:productVariantId/receipts" element={<RoleGuard roles={['ADMIN']}><StockReceiptsPage /></RoleGuard>} />
      <Route path="/admin/inventory/:productVariantId/adjustments" element={<RoleGuard roles={['ADMIN']}><StockAdjustmentsPage /></RoleGuard>} />
      <Route path="/admin/inventory-movements" element={<RoleGuard roles={['ADMIN']}><InventoryMovementsPage /></RoleGuard>} />
      <Route path="/admin/inventory-reservations" element={<RoleGuard roles={['ADMIN']}><InventoryReservationsPage /></RoleGuard>} />
      <Route path="/admin/:resourceKey" element={<RoleGuard roles={['ADMIN']}><AdminResourcePage /></RoleGuard>} />
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
