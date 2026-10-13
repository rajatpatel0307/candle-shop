import { ContentSection } from './ContentSection.jsx';

export function ContentPageRenderer({ page }) {
  if (!page) return null;
  return (
    <ContentSection>
      {page.summary && <p className="mb-5 text-lg text-stone-600">{page.summary}</p>}
      {page.contentFormat === 'HTML' ? (
        <div className="prose prose-stone max-w-none" dangerouslySetInnerHTML={{ __html: page.content }} />
      ) : (
        <pre className="whitespace-pre-wrap text-sm">{page.content}</pre>
      )}
    </ContentSection>
  );
}
