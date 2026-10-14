import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, RefreshCw, Save, X } from 'lucide-react';
import { adminProductsApi } from '../api/adminProductsApi.js';
import { AdminProductTable } from '../components/AdminProductTable.jsx';
import { ProductFilters } from '../components/ProductFilters.jsx';

const blankProduct = {
  ProductName: '',
  Slug: '',
  CategoryId: '',
  BrandId: '',
  ProductType: 'Candle',
  ProductStatus: 'Draft',
  IsFeatured: false,
  ShortDescription: '',
  Description: '',
  MetaTitle: '',
  MetaDescription: '',
  SKU: '',
  VariantName: 'Default',
  SellingPrice: '',
  CompareAtPrice: '',
  OnHandQuantity: 1,
  ReorderLevel: 0,
  VariantIsActive: true,
};

function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizeProductType(value) {
  return {
    CANDLE: 'Candle',
    GIFT_SET: 'GiftSet',
    ACCESSORY: 'Accessory',
    DIFFUSER: 'Other',
  }[value] || (['Candle', 'GiftSet', 'Accessory', 'Other'].includes(value) ? value : 'Candle');
}

function cleanPayload(form) {
  return {
    CategoryId: Number(form.CategoryId),
    BrandId: form.BrandId ? Number(form.BrandId) : null,
    ProductName: form.ProductName.trim(),
    Slug: form.Slug.trim(),
    ShortDescription: form.ShortDescription || null,
    Description: form.Description || null,
    ProductType: normalizeProductType(form.ProductType),
    ProductStatus: ['Draft', 'Active', 'Archived'].includes(form.ProductStatus) ? form.ProductStatus : 'Draft',
    IsFeatured: Boolean(form.IsFeatured),
    MetaTitle: form.MetaTitle || null,
    MetaDescription: form.MetaDescription || null,
  };
}

function cleanVariantPayload(form) {
  return {
    SKU: form.SKU.trim(),
    VariantName: form.VariantName.trim(),
    SellingPrice: Number(form.SellingPrice),
    CompareAtPrice: form.CompareAtPrice === '' ? null : Number(form.CompareAtPrice),
    IsActive: Boolean(form.VariantIsActive),
  };
}

function cleanInventoryPayload(form) {
  return {
    OnHandQuantity: Math.max(0, Number(form.OnHandQuantity) || 0),
    ReorderLevel: Math.max(0, Number(form.ReorderLevel) || 0),
  };
}

function ProductForm({ product, variant, inventory, categories = [], brands = [], pending, onCancel, onSubmit }) {
  const [form, setForm] = useState({
    ...blankProduct,
    ...(product || {}),
    ...(variant || {}),
    ...(inventory || {}),
    VariantIsActive: variant ? Boolean(variant.IsActive) : true,
  });
  const editing = Boolean(product?.ProductId);
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  function submit(event) {
    event.preventDefault();
    onSubmit({
      product: cleanPayload(form),
      variant: cleanVariantPayload(form),
      inventory: cleanInventoryPayload(form),
      variantId: variant?.ProductVariantId,
      hasInventory: Boolean(inventory?.ProductVariantId),
    });
  }

  return (
    <form className="rounded-md border border-stone-200 bg-white p-5 shadow-sm" onSubmit={submit}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">{editing ? 'Edit product' : 'New product'}</h2>
          <p className="mt-1 text-sm text-stone-500">{editing ? 'Update catalog details, price, availability, and storefront visibility.' : 'Create the product with its price and opening stock.'}</p>
        </div>
        <button className="icon-btn" type="button" onClick={onCancel} aria-label="Close form">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <label className="grid gap-1 text-sm font-medium text-stone-700">
          Product name
          <input className="input" value={form.ProductName} onChange={(event) => {
            const value = event.target.value;
            setForm((current) => ({
              ...current,
              ProductName: value,
              Slug: current.Slug || slugify(value),
              SKU: current.SKU || slugify(value).replace(/-/g, '_').toUpperCase(),
            }));
          }} required />
        </label>
        <label className="grid gap-1 text-sm font-medium text-stone-700">
          Slug
          <input className="input" value={form.Slug} onChange={(event) => set('Slug', slugify(event.target.value))} required />
        </label>
        <label className="grid gap-1 text-sm font-medium text-stone-700">
          Category
          <select className="input" value={form.CategoryId || ''} onChange={(event) => set('CategoryId', event.target.value)} required>
            <option value="">Choose a category</option>
            {categories.map((category) => <option key={category.CategoryId} value={category.CategoryId}>{category.CategoryName}</option>)}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-medium text-stone-700">
          Brand
          <select className="input" value={form.BrandId || ''} onChange={(event) => set('BrandId', event.target.value)}>
            <option value="">No brand</option>
            {brands.map((brand) => <option key={brand.BrandId} value={brand.BrandId}>{brand.BrandName}</option>)}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-medium text-stone-700">
          Type
          <select className="input" value={normalizeProductType(form.ProductType)} onChange={(event) => set('ProductType', event.target.value)}>
            <option value="Candle">Candle</option>
            <option value="GiftSet">Gift set</option>
            <option value="Accessory">Accessory</option>
            <option value="Other">Other</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm font-medium text-stone-700">
          Status
          <select className="input" value={['Draft', 'Active', 'Archived'].includes(form.ProductStatus) ? form.ProductStatus : 'Draft'} onChange={(event) => set('ProductStatus', event.target.value)}>
            <option value="Draft">Draft</option>
            <option value="Active">Active</option>
            <option value="Archived">Archived</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold text-stone-700">
          <input type="checkbox" checked={Boolean(form.IsFeatured)} onChange={(event) => set('IsFeatured', event.target.checked)} />
          Featured product
        </label>
        <label className="grid gap-1 text-sm font-medium text-stone-700 lg:col-span-2">
          Short description
          <input className="input" value={form.ShortDescription || ''} onChange={(event) => set('ShortDescription', event.target.value)} />
        </label>
        <label className="grid gap-1 text-sm font-medium text-stone-700 lg:col-span-2">
          Description
          <textarea className="input min-h-28" value={form.Description || ''} onChange={(event) => set('Description', event.target.value)} />
        </label>
        <div className="border-t border-stone-200 pt-4 lg:col-span-2">
          <h3 className="text-base font-semibold">Primary variant</h3>
          <p className="mt-1 text-sm text-stone-500">Price and stock are required before customers can add this product to their cart.</p>
        </div>
        <label className="grid gap-1 text-sm font-medium text-stone-700">
          SKU
          <input className="input" value={form.SKU || ''} onChange={(event) => set('SKU', event.target.value.toUpperCase())} required />
        </label>
        <label className="grid gap-1 text-sm font-medium text-stone-700">
          Variant name
          <input className="input" value={form.VariantName || ''} onChange={(event) => set('VariantName', event.target.value)} required />
        </label>
        <label className="grid gap-1 text-sm font-medium text-stone-700">
          Selling price (INR)
          <input className="input" type="number" min="0" step="0.01" value={form.SellingPrice ?? ''} onChange={(event) => set('SellingPrice', event.target.value)} required />
        </label>
        <label className="grid gap-1 text-sm font-medium text-stone-700">
          Compare-at price (INR)
          <input className="input" type="number" min={form.SellingPrice || 0} step="0.01" value={form.CompareAtPrice ?? ''} onChange={(event) => set('CompareAtPrice', event.target.value)} />
        </label>
        <label className="grid gap-1 text-sm font-medium text-stone-700">
          On-hand stock
          <input className="input" type="number" min="0" step="1" value={form.OnHandQuantity ?? 0} onChange={(event) => set('OnHandQuantity', event.target.value)} required />
        </label>
        <label className="grid gap-1 text-sm font-medium text-stone-700">
          Low-stock alert at
          <input className="input" type="number" min="0" step="1" value={form.ReorderLevel ?? 0} onChange={(event) => set('ReorderLevel', event.target.value)} required />
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold text-stone-700 lg:col-span-2">
          <input type="checkbox" checked={Boolean(form.VariantIsActive)} onChange={(event) => set('VariantIsActive', event.target.checked)} />
          Variant available for sale
        </label>
        <label className="grid gap-1 text-sm font-medium text-stone-700">
          Meta title
          <input className="input" value={form.MetaTitle || ''} onChange={(event) => set('MetaTitle', event.target.value)} maxLength={70} />
        </label>
        <label className="grid gap-1 text-sm font-medium text-stone-700">
          Meta description
          <input className="input" value={form.MetaDescription || ''} onChange={(event) => set('MetaDescription', event.target.value)} maxLength={170} />
        </label>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button className="btn-primary" disabled={pending || !form.ProductName || !form.Slug || !form.CategoryId || !form.SKU || !form.VariantName || form.SellingPrice === ''}>
          <Save className="h-4 w-4" />
          {pending ? 'Saving...' : 'Save product'}
        </button>
        <button className="btn-secondary" type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

export function AdminProductsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [featured, setFeatured] = useState('all');
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const productsQuery = useQuery({
    queryKey: ['admin-products', search],
    queryFn: async () => (await adminProductsApi.list({ search, limit: 200 })).data.data,
  });
  const categoriesQuery = useQuery({
    queryKey: ['admin-product-categories'],
    queryFn: async () => (await adminProductsApi.categories()).data.data,
  });
  const brandsQuery = useQuery({
    queryKey: ['admin-product-brands'],
    queryFn: async () => (await adminProductsApi.brands()).data.data,
  });
  const variantsQuery = useQuery({
    queryKey: ['admin-product-variants'],
    queryFn: async () => (await adminProductsApi.variants()).data.data,
  });
  const inventoryQuery = useQuery({
    queryKey: ['admin-product-inventory'],
    queryFn: async () => (await adminProductsApi.inventory()).data.data,
  });

  const products = productsQuery.data || [];
  const filteredProducts = useMemo(() => products.filter((product) => {
    if (status !== 'all' && product.ProductStatus !== status) return false;
    if (featured === 'featured' && !product.IsFeatured) return false;
    if (featured === 'standard' && product.IsFeatured) return false;
    return true;
  }), [products, status, featured]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    queryClient.invalidateQueries({ queryKey: ['admin-product-variants'] });
    queryClient.invalidateQueries({ queryKey: ['admin-product-inventory'] });
  };
  const saveMutation = useMutation({
    mutationFn: async ({ productId, bundle }) => {
      const productResponse = productId
        ? await adminProductsApi.update(productId, bundle.product)
        : await adminProductsApi.create(bundle.product);
      const savedProduct = productResponse.data.data;
      const variantPayload = { ...bundle.variant, ProductId: savedProduct.ProductId };
      const variantResponse = bundle.variantId
        ? await adminProductsApi.updateVariant(bundle.variantId, variantPayload)
        : await adminProductsApi.createVariant(variantPayload);
      const savedVariant = variantResponse.data.data;
      const inventoryPayload = {
        ...bundle.inventory,
        ProductVariantId: savedVariant.ProductVariantId,
        ...(bundle.hasInventory ? {} : { ReservedQuantity: 0 }),
      };
      if (bundle.hasInventory) {
        await adminProductsApi.updateInventory(savedVariant.ProductVariantId, inventoryPayload);
      } else {
        await adminProductsApi.createInventory(inventoryPayload);
      }
      return savedProduct;
    },
    onSuccess: () => {
      invalidate();
      setEditing(null);
      setShowForm(false);
    },
  });
  const updateMutation = useMutation({
    mutationFn: ({ productId, payload }) => adminProductsApi.update(productId, payload),
    onSuccess: invalidate,
  });
  const deleteMutation = useMutation({ mutationFn: adminProductsApi.remove, onSuccess: invalidate });

  function saveProduct(bundle) {
    saveMutation.mutate({ productId: editing?.ProductId, bundle });
  }

  function quickUpdate(product, payload) {
    updateMutation.mutate({ productId: product.ProductId, payload });
  }

  const editingVariant = (variantsQuery.data || []).find((variant) => variant.ProductId === editing?.ProductId);
  const editingInventory = (inventoryQuery.data || []).find((item) => item.ProductVariantId === editingVariant?.ProductVariantId);
  const busy = saveMutation.isPending || updateMutation.isPending || deleteMutation.isPending;
  const error = productsQuery.error || variantsQuery.error || inventoryQuery.error || saveMutation.error || updateMutation.error || deleteMutation.error;
  const errorMessage = error?.response?.data?.error?.message || error?.message;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase text-[#697565]">Catalog</p>
          <h1 className="mt-1 text-4xl font-semibold">Products</h1>
          <p className="mt-2 max-w-2xl text-sm text-stone-600">Manage product records, storefront status, featured placement, and search visibility.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary" type="button" onClick={() => productsQuery.refetch()}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button className="btn-primary" type="button" onClick={() => { setEditing(null); setShowForm(true); }}>
            <Plus className="h-4 w-4" />
            Add product
          </button>
        </div>
      </div>

      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-md border border-stone-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-stone-500">Total</p>
          <p className="mt-1 text-2xl font-semibold">{products.length}</p>
        </div>
        <div className="rounded-md border border-stone-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-stone-500">Active</p>
          <p className="mt-1 text-2xl font-semibold">{products.filter((product) => product.ProductStatus === 'Active').length}</p>
        </div>
        <div className="rounded-md border border-stone-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-stone-500">Featured</p>
          <p className="mt-1 text-2xl font-semibold">{products.filter((product) => product.IsFeatured).length}</p>
        </div>
      </section>

      <div className="mt-6 grid gap-4">
        <ProductFilters search={search} status={status} featured={featured} onSearch={setSearch} onStatus={setStatus} onFeatured={setFeatured} />

        {(showForm || editing) && (
          <ProductForm
            key={`${editing?.ProductId || 'new'}-${editingVariant?.ProductVariantId || 'no-variant'}`}
            product={editing}
            variant={editingVariant}
            inventory={editingInventory}
            categories={categoriesQuery.data || []}
            brands={brandsQuery.data || []}
            pending={saveMutation.isPending}
            onCancel={() => { setEditing(null); setShowForm(false); }}
            onSubmit={saveProduct}
          />
        )}

        {errorMessage && <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p>}

        <AdminProductTable
          products={filteredProducts}
          loading={productsQuery.isLoading}
          onEdit={(product) => { setEditing(product); setShowForm(false); }}
          onDelete={(product) => {
            if (window.confirm(`Delete ${product.ProductName}?`)) deleteMutation.mutate(product.ProductId);
          }}
          onStatus={(product, nextStatus) => quickUpdate(product, { ProductStatus: nextStatus })}
          onFeatured={(product) => quickUpdate(product, { IsFeatured: !product.IsFeatured })}
        />

        {busy && <p className="text-sm text-stone-500">Saving catalog changes...</p>}
      </div>
    </main>
  );
}
