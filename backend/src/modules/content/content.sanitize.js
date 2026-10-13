const BLOCKED_TAGS = /<\/?(script|iframe|object|embed|style|link|meta|base|form|input|button|textarea|select)[^>]*>/gi;
const EVENT_ATTRIBUTES = /\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;
const JAVASCRIPT_URLS = /\s+(href|src)\s*=\s*(["'])\s*javascript:[\s\S]*?\2/gi;

export function sanitizeContent(value = '') {
  return String(value)
    .replace(BLOCKED_TAGS, '')
    .replace(EVENT_ATTRIBUTES, '')
    .replace(JAVASCRIPT_URLS, ' $1="#"')
    .replace(/\s+style\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');
}
