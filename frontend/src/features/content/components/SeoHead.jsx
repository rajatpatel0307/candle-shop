import { useEffect } from 'react';

function setMeta(name, content, property = false) {
  if (!content) return;
  const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
  let tag = document.head.querySelector(selector);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(property ? 'property' : 'name', name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

export function SeoHead({ seo, fallbackTitle }) {
  useEffect(() => {
    if (!seo && !fallbackTitle) return;
    document.title = seo?.metaTitle || fallbackTitle || 'Candle Studio';
    setMeta('description', seo?.metaDescription);
    setMeta('robots', seo?.robotsDirective);
    setMeta('og:title', seo?.ogTitle || seo?.metaTitle, true);
    setMeta('og:description', seo?.ogDescription || seo?.metaDescription, true);
    setMeta('og:image', seo?.ogImageUrl, true);
    let link = document.head.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', seo?.canonicalUrl || window.location.href);
  }, [seo, fallbackTitle]);
  return null;
}
