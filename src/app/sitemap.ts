// 다국어 사이트맵 — 5개 언어 × 4개 페이지 (noindex인 business/privacy/refund/terms는 제외)
import type { MetadataRoute } from 'next';
import { SITE_URL, SUPPORTED_LANGS } from '@/lib/seo';

const PAGES: Array<{
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
}> = [
  { path: '',         priority: 1.0, changeFrequency: 'weekly'  },
  { path: '/pricing', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/editor',  priority: 0.7, changeFrequency: 'monthly' },
  { path: '/batch',   priority: 0.7, changeFrequency: 'monthly' },
];

// 실제 콘텐츠 변경일. 매 빌드마다 new Date()로 찍으면 Google이 신뢰하지 않으므로
// 콘텐츠를 실제로 고칠 때만 이 값을 올린다.
const LAST_MODIFIED = '2026-07-27';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date(LAST_MODIFIED);
  return SUPPORTED_LANGS.flatMap(lang =>
    PAGES.map(({ path, priority, changeFrequency }) => ({
      url: `${SITE_URL}/${lang}${path}`,
      lastModified: now,
      changeFrequency,
      priority,
    }))
  );
}
