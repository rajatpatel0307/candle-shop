import { ContentManager } from '../components/ContentManager.jsx';
import { FeaturedProductForm } from '../components/FeaturedProductForm.jsx';
export function ManageFeaturedProducts() { return <ContentManager kind="featured" title="Featured products" description="Choose products for storefront sections and control their display order." Form={FeaturedProductForm} />; }
