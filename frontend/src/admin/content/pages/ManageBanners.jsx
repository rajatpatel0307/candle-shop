import { ContentManager } from '../components/ContentManager.jsx';
import { BannerForm } from '../components/BannerForm.jsx';
export function ManageBanners() { return <ContentManager kind="banners" title="Homepage banners" description="Create, edit, order, and publish the banners shown on your storefront." Form={BannerForm} />; }
