import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { contentApi } from '../content.api.js';
import { Breadcrumbs } from '../components/Breadcrumbs.jsx';
import { ContentPageRenderer } from '../components/ContentPageRenderer.jsx';
import { SeoHead } from '../components/SeoHead.jsx';
import { breadcrumbLabel, pageTitle } from '../content.utils.js';

export function ContentPage({ slug: explicitSlug }) {
  const params = useParams();
  const slug = explicitSlug || params.slug;
  const page = useQuery({ queryKey: ['content-page', slug], queryFn: async () => (await contentApi.page(slug)).data.data.page, retry: false });
  const seo = useQuery({ queryKey: ['content-seo', slug], queryFn: async () => (await contentApi.seo({ path: `/${slug}` })).data.data.seo, retry: false });

  if (page.isError) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <h1 className="text-4xl font-semibold">Page not found</h1>
        <Link className="mt-4 inline-block text-[#8d5132] underline" to="/">Return home</Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <SeoHead seo={seo.data} fallbackTitle={pageTitle(page.data)} />
      <Breadcrumbs items={[{ label: page.data?.title || breadcrumbLabel(slug) }]} />
      <h1 className="mt-4 text-4xl font-semibold">{page.data?.title || breadcrumbLabel(slug)}</h1>
      <div className="mt-6">
        {page.isLoading ? <div className="h-72 animate-pulse rounded-lg bg-stone-200" /> : <ContentPageRenderer page={page.data} />}
      </div>
    </main>
  );
}
