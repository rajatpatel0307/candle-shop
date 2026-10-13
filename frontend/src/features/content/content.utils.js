export function pageTitle(page) {
  return page?.title || 'Content';
}

export function breadcrumbLabel(slug = '') {
  return slug.split('-').filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}
