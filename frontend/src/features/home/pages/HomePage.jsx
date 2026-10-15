import { useQuery } from '@tanstack/react-query';
import { ArrowRight, ArrowUpRight, ChevronDown, Flame, Gift, Heart, PackageCheck, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { endpoints } from '../../../services/endpoints.js';
import { apiClient } from '../../../services/apiClient.js';
import { homeApi } from '../home.api.js';
import { HomeHero } from '../components/HomeHero.jsx';
import { PromotionalSection } from '../components/PromotionalSection.jsx';
import { FeaturedProducts } from '../components/FeaturedProducts.jsx';
import { eligibleItems } from '../home.utils.js';

const questions = [
  ['How do I find the right candle?', 'Start with a fragrance or collection that catches your eye. Each product page has its available variants, price, and product details, so you can choose something that feels right for your space.'],
  ['Can I save something for later?', 'Of course. Sign in and tap the heart on a product to save it to your wishlist. Your favourites will be waiting in your account when you come back.'],
  ['Where can I find delivery charges?', 'Add your chosen pieces to your cart and enter your delivery address at checkout. You can review shipping charges and your full order total before you place the order.'],
  ['How do I check my order?', 'Sign in and open My orders from your account. You can view your order details, follow its status, and see shipment tracking when it is available.'],
];
function CollectionCard({title,description,image,to,index}) {
  return <Link to={to} className="group min-w-0"><div className="relative aspect-[5/4] overflow-hidden bg-[#e6ded0]"><img src={image} alt="" loading="lazy" onError={(event) => {if(!event.currentTarget.src.endsWith('candle-detail.jpg'))event.currentTarget.src='/images/home/candle-detail.jpg';}} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" /><span className="absolute left-5 top-5 flex h-8 w-8 items-center justify-center rounded-full border border-white/50 text-[10px] text-white">0{index+1}</span><span className="absolute bottom-5 right-5 flex h-10 w-10 items-center justify-center rounded-full bg-[#fffdf7] text-[#554534] transition group-hover:bg-[#554534] group-hover:text-white"><ArrowUpRight className="h-4 w-4" /></span></div><h3 className="mt-5 font-serif text-2xl text-[#423629]">{title}</h3><p className="mt-2 max-w-sm text-sm leading-6 text-[#807568]">{description}</p></Link>;
}
export function HomePage() {
  const home=useQuery({queryKey:['content-home'],queryFn:async () => (await homeApi.getHome()).data.data,retry:false,staleTime:60000});
  const categories=useQuery({queryKey:['home-categories'],queryFn:async () => (await apiClient.get(endpoints.categories)).data.data,retry:false,staleTime:60000});
  const catalog=useQuery({queryKey:['home-products'],queryFn:async () => (await apiClient.get(endpoints.products,{params:{limit:24}})).data.data,retry:false,staleTime:60000});
  const data=home.data || {};
  const products=catalog.data || [];
  const featured=(data.featuredProducts || []).map((product) => ({...product,...products.find((item) => item.ProductId?.toLowerCase()===(product.productId || product.ProductId)?.toLowerCase())}));
  const merged=[...featured,...products];
  const ids=new Set();
  const unique=merged.filter((product) => {const id=String(product.ProductId || product.productId).toLowerCase();if(!(product.Slug || product.slug) || ids.has(id))return false;ids.add(id);return true;});
  const collectionCards=(categories.data || []).slice(0,2).map((category,index) => ({title:category.CategoryName,description:category.Description || 'Discover the pieces in this collection.',image:category.ImageUrl || (index ? '/images/home/candle-ritual.jpg':'/images/home/candle-atmosphere.jpg'),to:`/shop?category=${encodeURIComponent(category.Slug)}`}));
  collectionCards.push({title:'All things lovely',description:'A little light, a thoughtful gift, a new favourite. Explore the whole collection.',image:'/images/home/candle-detail.jpg',to:'/shop'});
  const gift=products.find((product) => product.ProductType==='GiftSet');
  const giftLink=gift?.CategorySlug ? `/shop?category=${encodeURIComponent(gift.CategorySlug)}`:'/shop';
  return <main className="home-page">
    <div className="home-announcement"><span>A slower pace. A warmer space.</span><Link to="/shop" className="inline-flex items-center gap-2 border-b border-white/40 pb-0.5">Discover Candle Studio<ArrowRight className="h-3 w-3" /></Link></div>
    <HomeHero banners={data.banners || []} />
    <section aria-label="Explore Candle Studio" className="home-intro-strip"><div><Flame strokeWidth={1.3} /><span>For your everyday rituals</span></div><div><Gift strokeWidth={1.3} /><span>For the joy of giving</span></div><div><Heart strokeWidth={1.3} /><span>For a space that feels like you</span></div></section>
    <FeaturedProducts products={unique} pending={catalog.isPending && !featured.length} error={catalog.error} onRetry={() => catalog.refetch()} />
    <section className="home-manifesto"><Sparkles className="mx-auto h-5 w-5 text-[#9a7958]" strokeWidth={1} /><p className="home-eyebrow mt-5">A little more presence</p><h2 className="home-heading mx-auto mt-5 max-w-3xl">Less rush. More ritual.<br /><span className="italic text-[#8b7053]">That's the Candle Studio way.</span></h2><p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-[#807568]">The first light of an evening. A favourite corner. A thoughtful something for someone you love. We believe the little things can change how a day feels.</p></section>
    <section id="collections" className="home-section"><div className="mb-9 flex flex-wrap items-end justify-between gap-5"><div><p className="home-eyebrow">A world to make your own</p><h2 className="home-heading mt-3">Follow your feeling.</h2></div><Link to="/categories" className="home-text-link flex items-center gap-3">Explore collections<ArrowUpRight className="h-4 w-4" /></Link></div>{categories.isPending ? <div aria-label="Loading collections" role="status" className="grid gap-6 sm:grid-cols-2">{[1,2].map((key) => <div key={key} className="aspect-[5/4] animate-pulse bg-[#eee7dd]" />)}</div>:<div className={`grid gap-x-7 gap-y-10 sm:grid-cols-2 ${collectionCards.length>2 ? 'lg:grid-cols-3':''}`}>{collectionCards.map((card,index) => <CollectionCard key={card.to} {...card} index={index} />)}</div>}</section>
    <section className="home-gifting"><div className="home-gifting-image"><img src="/images/home/candle-ritual.jpg" alt="The warm glow of a candle beside soft lights" loading="lazy" /><span className="absolute bottom-6 left-6 text-[10px] uppercase tracking-[.22em] text-white/80">The gift of a little pause</span></div><div className="home-gifting-copy"><Gift className="mb-8 h-7 w-7 text-[#a1815d]" strokeWidth={1} /><p className="home-eyebrow">Some things say it softly</p><h2 className="home-heading mt-4">For them.<br />For you.<br /><span className="italic text-[#8b7053]">Just because.</span></h2><p className="mt-6 max-w-sm text-sm leading-7 text-[#807568]">A birthday, a new beginning, or no occasion at all. Give a little warmth to the people who make your world brighter.</p><Link className="home-button mt-8 w-fit" to={giftLink}>Find a thoughtful gift<ArrowUpRight className="h-4 w-4" /></Link></div></section>
    {eligibleItems(data.promotions || []).length>0 && <section className="home-section grid gap-8">{eligibleItems(data.promotions).map((section) => <PromotionalSection key={section.id} section={section} />)}</section>}
    <section className="home-section grid gap-12 lg:grid-cols-[.85fr_1.15fr] lg:gap-24"><div><p className="home-eyebrow">A little guidance</p><h2 className="home-heading mt-4">Make yourself<br />at home.</h2><p className="mt-5 max-w-xs text-sm leading-7 text-[#807568]">A few things to know before your next favourite arrives.</p><Link to="/contact" className="home-text-link mt-6 inline-flex items-center gap-4">We're here to help<ArrowUpRight className="h-4 w-4" /></Link></div><div className="border-t border-[#ded5c8]">{questions.map(([question,answer]) => <details key={question} className="home-faq group border-b border-[#ded5c8]"><summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-sm font-medium">{question}<ChevronDown className="h-4 w-4 shrink-0 text-[#9a7958] transition-transform group-open:rotate-180" /></summary><p className="pb-6 pr-8 text-sm leading-7 text-[#807568]">{answer}</p></details>)}</div></section>
    <section className="home-closing"><div className="mx-auto max-w-2xl"><p className="home-eyebrow text-[#c3b49a]">Make a little room for yourself</p><h2 className="home-heading mt-5 text-[#faf6ee]">Your next slow moment<br /><span className="italic">starts here.</span></h2><Link to="/shop" className="home-button home-button-light mt-8">Find your glow<ArrowUpRight className="h-4 w-4" /></Link></div></section>
    <section className="home-service-strip"><div><ShieldCheck /><span>Shop with confidence<small>Review every detail before checkout</small></span></div><div><PackageCheck /><span>Your order, in one place<small>Follow your order from your account</small></span></div><Link to="/contact"><Heart /><span>A little help, whenever you need it<small>Talk to the Candle Studio team</small></span></Link></section>
  </main>;
}
