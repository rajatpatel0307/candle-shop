import test from 'node:test';
import assert from 'node:assert/strict';
import { bannerSchema, pageSchema, promotionSchema, seoSchema } from './content.validation.js';
import { sanitizeContent } from './content.sanitize.js';

test('bannerSchema rejects invalid date ranges', () => {
  const result = bannerSchema.safeParse({
    title: 'Holiday candles',
    desktopImageUrl: 'https://example.com/banner.jpg',
    startAtUtc: '2026-12-31T00:00:00.000Z',
    endAtUtc: '2026-01-01T00:00:00.000Z',
  });
  assert.equal(result.success, false);
});

test('promotionSchema accepts safe relative CTA URLs', () => {
  const result = promotionSchema.safeParse({
    title: 'Gift sets',
    layoutType: 'IMAGE_RIGHT',
    buttonUrl: '/shop?category=gifts',
  });
  assert.equal(result.success, true);
});

test('pageSchema validates URL friendly slugs', () => {
  const result = pageSchema.safeParse({
    title: 'About Us',
    slug: 'about-us',
    pageType: 'ABOUT',
    content: '<h2>Our studio</h2>',
  });
  assert.equal(result.success, true);
});

test('seoSchema rejects unsafe canonical URL schemes', () => {
  const result = seoSchema.safeParse({
    entityType: 'PATH',
    path: '/about',
    metaTitle: 'About Candle Studio',
    metaDescription: 'Learn about Candle Studio and our candle collections.',
    canonicalUrl: 'javascript:alert(1)',
  });
  assert.equal(result.success, false);
});

test('sanitizeContent removes executable markup', () => {
  const clean = sanitizeContent('<h1 onclick="alert(1)">Hi</h1><script>alert(1)</script><a href="javascript:alert(1)">bad</a>');
  assert.equal(clean.includes('<script>'), false);
  assert.equal(clean.includes('onclick'), false);
  assert.equal(clean.includes('javascript:'), false);
});
