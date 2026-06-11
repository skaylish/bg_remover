// 다국어 사이트맵 — 5개 언어 × 4개 페이지
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

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return SUPPORTED_LANGS.flatMap(lang =>
    PAGES.map(({ path, priority, changeFrequency }) => ({
      url: `${SITE_URL}/${lang}${path}`,
      lastModified: now,
      changeFrequency,
      priority,
    }))
  );
}
