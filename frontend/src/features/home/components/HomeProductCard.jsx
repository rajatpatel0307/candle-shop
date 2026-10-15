import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowUpRight, Flame, Heart } from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth.js';
import { useWishlist, useWishlistMutations } from '../../wishlist/hooks/useWishlist.js';
const money=(value) => new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(Number(value));
export function HomeProductCard({product}) {
  const navigate=useNavigate();
  const {user}=useAuth();
  const wishlist=useWishlist();
  const actions=useWishlistMutations();
  const [imageFailed,setImageFailed]=useState(false);
  const id=product.ProductId || product.productId;
  const slug=product.Slug || product.slug;
  const name=product.ProductName || product.productName;
  const image=product.ImageUrl || product.imageUrl;
  const price=product.SellingPrice ?? product.sellingPrice;
  const compare=product.CompareAtPrice ?? product.compareAtPrice;
  const saved=wishlist.data?.items?.some((item) => String(item.ProductId).toLowerCase()===String(id).toLowerCase());
  const error=actions.add.error || actions.removeByProduct.error;
  const toggle=() => {if(!user){navigate('/login');return;}if(saved)actions.removeByProduct.mutate(id);else actions.add.mutate({productId:id});};
  return <article className="group min-w-0"><div className="relative overflow-hidden bg-[#eee7dd]"><Link to={`/products/${slug}`} className="block aspect-[4/5] overflow-hidden" aria-label={`View ${name}`}>{image && !imageFailed ? <img src={image} alt={name} loading="lazy" onError={() => setImageFailed(true)} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />:<div className="flex h-full flex-col items-center justify-center bg-[radial-gradient(ellipse_at_center,_#faf7ef,_#e8dece)] text-[#a78a6e]"><Flame strokeWidth={1} className="h-14 w-14" /><span className="mt-5 text-[10px] font-medium uppercase tracking-[.3em]">Candle Studio</span></div>}</Link><button type="button" aria-label={saved ? `Remove ${name} from wishlist`:`Save ${name} to wishlist`} aria-pressed={Boolean(saved)} disabled={!id || actions.add.isPending || actions.removeByProduct.isPending || (Boolean(user) && wishlist.isPending)} onClick={toggle} className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#fffdf7]/90 text-[#614d3c] transition hover:bg-white disabled:opacity-50"><Heart className={`h-4 w-4 ${saved ? 'fill-current':''}`} strokeWidth={1.5} /></button><Link to={`/products/${slug}`} className="absolute inset-x-4 bottom-4 flex items-center justify-between bg-[#fffdf7]/95 px-4 py-3 text-xs font-medium text-[#423629] transition hover:bg-white">Discover this piece<ArrowUpRight className="h-4 w-4" /></Link></div><div className="px-0.5 pt-4"><p className="home-eyebrow text-[9px]">{product.CategoryName || product.categoryName || 'From the collection'}</p><div className="mt-2 flex items-start justify-between gap-3"><h3 className="font-serif text-xl leading-7"><Link to={`/products/${slug}`}>{name}</Link></h3><div className="shrink-0 pt-1 text-right text-sm">{price==null ? 'View details':money(price)}{Number(compare)>Number(price) && <del className="mt-1 block text-xs text-stone-400">{money(compare)}</del>}</div></div>{(product.ShortDescription || product.shortDescription) && <p className="mt-2 line-clamp-2 text-xs leading-6 text-[#807568]">{product.ShortDescription || product.shortDescription}</p>}{error && <p role="alert" className="mt-2 text-xs text-red-700">{error.response?.data?.error?.message || 'Could not update your wishlist. Try again.'}</p>}</div></article>;
}
