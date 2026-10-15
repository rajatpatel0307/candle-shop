import { ContentManager } from '../components/ContentManager.jsx';
import { SeoForm } from '../components/SeoForm.jsx';
export function ManageSeo() { return <ContentManager kind="seo" title="SEO metadata" description="Manage page titles, descriptions, social previews, and indexing." Form={SeoForm} />; }
