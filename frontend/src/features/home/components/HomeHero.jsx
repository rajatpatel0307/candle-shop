import { BannerCarousel } from './BannerCarousel.jsx';
const defaultBanner = {
  id: 'studio-welcome',
  subtitle: 'The beauty of slowing down',
  title: 'A little light.\nA softer moment.',
  description: 'Turn the everyday into a moment worth staying in. Discover candles, thoughtful gifts, and a warmer kind of home.',
  desktopImageUrl: '/images/home/candle-atmosphere.jpg',
  altText: 'A glowing candle with autumn botanicals on a warm wooden table',
  buttonText: 'Explore the collection', buttonUrl: '/shop',
  secondaryButtonText: 'Meet Candle Studio', secondaryButtonUrl: '/about',
};
export function HomeHero({ banners = [] }) {
  return <BannerCarousel banners={banners.length ? banners : [defaultBanner]} />;
}
