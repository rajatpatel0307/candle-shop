import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Flame, ShoppingBag, ArrowRight, Truck, ShieldCheck, Star, Check, Package, Clock, Leaf } from 'lucide-react';
import { apiClient } from '../../../services/apiClient.js';
import { endpoints } from '../../../services/endpoints.js';
import { useAuth } from '../../auth/hooks/useAuth.js';
import { useCart, useCartMutations } from '../../cart/hooks/useCart.js';
import { CartQuantityControl } from '../../cart/components/CartQuantityControl.jsx';
import { WishlistButton } from '../../wishlist/components/WishlistButton.jsx';
import { ProductReviewsSection } from '../../reviews/components/ProductReviewsSection.jsx';
import { reviewsApi } from '../../reviews/reviews.api.js';
import { currency } from '../../orders/utils/ordersHelpers.js';

export function ProductDetailsPage() {
  const {slug} = useParams();
  const navigate = useNavigate();
  const {user} = useAuth();
  const cart = useCart();
  const actions = useCartMutations();
  const [variantId,setVariantId] = useState('');
  const [quantity,setQuantity] = useState(1);
  const [imageIndex,setImageIndex] = useState(0);
  const productQuery = useQuery({queryKey:['product',slug],queryFn:async () => (await apiClient.get(endpoints.product(slug))).data.data,retry:false});
  const product = productQuery.data;
  const summary = useQuery({queryKey:['review-summary',product?.ProductId],enabled:Boolean(product?.ProductId),queryFn:async () => (await reviewsApi.summary(product.ProductId)).data.data.summary});
  useEffect(() => {setVariantId('');setQuantity(1);setImageIndex(0);actions.add.reset();},[slug]);
  const variant = product?.variants?.find((v) => v.ProductVariantId === variantId) || product?.variants?.[0];
  const available = Number(variant?.AvailableQuantity || 0);
  const inCart = Number(cart.data?.items?.find((item) => item.ProductVariantId?.toLowerCase() === variant?.ProductVariantId?.toLowerCase())?.Quantity || 0);
  const remaining = Math.max(0,Math.min(99,available)-inCart);
  const selectedQuantity = Math.min(quantity,remaining);
  const images = product?.images?.filter((img) => !img.ProductVariantId || img.ProductVariantId.toLowerCase() === variant?.ProductVariantId?.toLowerCase()) || [];
  const selectedImage = images[imageIndex] || images[0];
  const price = Number(variant?.SellingPrice ?? product?.SellingPrice ?? 0);
  const comparePrice = Number(variant?.CompareAtPrice || 0);
  const canAdd = Boolean(variant) && remaining > 0;
  const busy = actions.add.isPending || (user && cart.isPending);
  async function add(buyNow=false) {
    if(!user){navigate('/login');return;}
    try {await actions.add.mutateAsync({productId:product.ProductId,productVariantId:variant.ProductVariantId,quantity:selectedQuantity});if(buyNow)navigate('/checkout');}catch{}
  }
  if(productQuery.isPending) return <main className="mx-auto w-full min-w-0 max-w-7xl px-4 py-10 sm:px-6"><div className="grid gap-8 md:grid-cols-2 lg:gap-12"><div className="aspect-[4/5] rounded-2xl bg-white motion-safe:animate-pulse" /><div className="h-96 rounded-2xl bg-white motion-safe:animate-pulse" /></div></main>;
  if(productQuery.isError || !product) return <main className="mx-auto w-full min-w-0 max-w-7xl px-4 py-16 sm:px-6"><section className="account-panel text-center"><Package className="mx-auto h-10 w-10 text-stone-400" /><h1 className="mt-5 text-2xl font-semibold">{productQuery.error?.response?.status===404 ? 'Product not found' : 'Could not load this product'}</h1><p className="mt-3 text-sm text-stone-500">Please try again or browse the collection.</p><div className="mt-6 flex flex-wrap justify-center gap-3"><button className="btn-secondary" onClick={() => productQuery.refetch()}>Try again</button><Link className="btn-primary" to="/shop">Browse candles</Link></div></section></main>;
  const highlights = [[Leaf,'Fragrance',variant?.FragranceName],[Clock,'Burn time',variant?.BurnTimeHours ? `${variant.BurnTimeHours} hours` : null],[Package,'Size',variant?.SizeValue ? `${variant.SizeValue} ${variant.SizeUnit || ''}` : null]].filter((row) => row[2]);
  return <main className="customer-product-page mx-auto w-full min-w-0 max-w-7xl space-y-10 px-4 pb-12 pt-7 sm:px-6">
    <div className="grid items-start gap-8 md:grid-cols-2 lg:gap-12">
      <div className="min-w-0 space-y-4 lg:sticky lg:top-24"><div className="customer-product-gallery relative flex aspect-[4/5] items-center justify-center overflow-hidden border border-[#e9dfd1] bg-[#eee7dd]">{selectedImage ? <img src={selectedImage.ImageUrl} alt={selectedImage.AltText || product.ProductName} className="h-full w-full object-contain" /> : <div className="text-center"><Flame className="mx-auto h-24 w-24 text-[#c39b75]" strokeWidth={1} /><p className="mt-5 text-xs uppercase tracking-[0.25em] text-[#b49b80]">Candle Studio</p></div>}{comparePrice>price && <span className="absolute left-5 top-5 rounded-full bg-[#f1e7d8] px-3 py-1.5 text-xs font-semibold text-[#8b6744]">{Math.round((comparePrice-price)/comparePrice*100)}% off</span>}</div>{images.length>1 && <div className="flex gap-3 overflow-x-auto pb-1">{images.map((img,index) => <button key={`${img.ImageUrl}-${index}`} className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-white ${index===imageIndex ? 'border-[#9c734f]' : 'border-transparent'}`} aria-label={`View product image ${index+1}`} aria-pressed={index===imageIndex} onClick={() => setImageIndex(index)}><img src={img.ImageUrl} alt="" className="h-full w-full object-cover" /></button>)}</div>}</div>
      <section className="customer-product-details min-w-0 py-1"><p className="account-eyebrow">{product.BrandName || product.CategoryName || 'Candle Studio'}</p><h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">{product.ProductName}</h1><a href="#reviews" className="mt-4 inline-flex items-center gap-3 text-xs text-stone-500">{Number(summary.data?.ReviewCount)>0 ? <><span className="inline-flex items-center gap-1 rounded bg-[#7a8a63] px-2 py-1 font-semibold text-white">{Number(summary.data.AverageRating).toFixed(1)}<Star className="h-3 w-3 fill-current" /></span>{summary.data.ReviewCount} ratings & reviews</> : <span>No reviews yet. View ratings</span>}</a>
      <p className="mt-5 text-sm leading-7 text-stone-500">{product.ShortDescription || product.Description}</p>
      <div className="mt-6 flex items-baseline gap-3"><p className="text-3xl font-semibold">{currency(price)}</p>{comparePrice>price && <s className="text-base text-stone-400">{currency(comparePrice)}</s>}</div><p className="mt-2 text-xs text-stone-400">Delivery charges calculated at checkout.</p>
      {product.variants?.length>0 && <fieldset className="mt-7"><legend className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-500">Choose your option</legend><div className="flex flex-wrap gap-2">{product.variants.map((v) => <button type="button" key={v.ProductVariantId} aria-pressed={variant?.ProductVariantId===v.ProductVariantId} onClick={() => {setVariantId(v.ProductVariantId);setQuantity(1);setImageIndex(0);actions.add.reset();}} className={`rounded-lg border px-4 py-3 text-xs font-medium transition ${variant?.ProductVariantId===v.ProductVariantId ? 'border-[#a67b56] bg-[#f4eadb] text-[#8d623f]' : 'border-stone-200 bg-white text-stone-500'}`}>{v.VariantName}{Number(v.AvailableQuantity)<=0 ? ' (Out of stock)' : ''}</button>)}</div></fieldset>}
      <div className="mt-6 flex flex-wrap items-center gap-3"><span className={`flex items-center gap-1.5 text-xs ${available>0 ? 'text-[#75865c]' : 'text-red-700'}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{available>0 ? `${available} available` : 'Currently out of stock'}</span>{inCart>0 && <span className="text-xs text-stone-400">{inCart} already in your cart</span>}</div>
      <div className="mt-5 flex flex-wrap items-center gap-3">{canAdd && <CartQuantityControl value={selectedQuantity} max={remaining} disabled={busy} onChange={setQuantity} />}<WishlistButton productId={product.ProductId} productVariantId={variant?.ProductVariantId} /></div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2"><button className="btn-secondary rounded-xl py-4" disabled={busy || !canAdd} onClick={() => add()}><ShoppingBag className="h-4 w-4" />{actions.add.isPending ? 'Adding...' : 'Add to cart'}</button><button className="btn-primary rounded-xl py-4" disabled={busy || !canAdd} onClick={() => add(true)}>Buy now<ArrowRight className="h-4 w-4" /></button></div>
      {!canAdd && inCart>0 && available>0 && <p className="mt-3 text-xs text-amber-700">You have reached the stock limit. <Link to="/cart" className="underline">View cart</Link></p>}
      {actions.add.isSuccess && <p role="status" className="mt-3 flex items-center gap-2 text-sm text-green-700"><Check className="h-4 w-4" />Added to cart. <Link to="/cart" className="underline">View cart</Link></p>}
      {actions.add.isError && <p role="alert" className="mt-3 text-sm text-red-700">{actions.add.error?.response?.data?.error?.message || 'Could not add to cart. Please try again.'}</p>}
      {highlights.length>0 && <div className="mt-7 grid grid-cols-2 gap-3">{highlights.map(([Icon,label,value]) => <div key={label} className="rounded-xl border border-[#e9dfd1] bg-white/60 p-4"><Icon className="mb-3 h-5 w-5 text-[#a68462]" strokeWidth={1.4} /><p className="text-[10px] uppercase tracking-wide text-stone-400">{label}</p><p className="mt-1 text-xs font-semibold">{value}</p></div>)}</div>}
      <div className="mt-7 grid gap-4 border-t border-stone-200 pt-6"><p className="flex items-center gap-3 text-xs text-stone-500"><Truck className="h-4 w-4 text-[#a68462]" />Select your delivery address at checkout.</p><p className="flex items-center gap-3 text-xs text-stone-500"><ShieldCheck className="h-4 w-4 text-[#a68462]" />Cash on delivery and secure checkout available.</p></div>
      </section>
    </div>
    {(product.Description || product.specifications?.length>0) && <section className="account-panel"><h2 className="text-xl font-semibold">About this piece</h2>{product.Description && <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-stone-500">{product.Description}</p>}{product.specifications?.length>0 && <dl className="mt-5 divide-y divide-stone-100">{product.specifications.map((spec,index) => <div key={index} className="grid gap-2 py-3 text-sm sm:grid-cols-[200px_1fr]"><dt className="text-stone-400">{spec.SpecificationName}</dt><dd>{spec.SpecificationValue}</dd></div>)}</dl>}</section>}
    <ProductReviewsSection key={product.ProductId} productId={product.ProductId} />
  </main>;
}
