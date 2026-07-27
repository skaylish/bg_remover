// 검색 엔진 크롤러 설정
import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

// AI 검색엔진 크롤러. 전체 허용이므로 기본 규칙과 동작은 같지만,
// 명시해 두면 기본값이 바뀌어도 의도가 유지된다.
const AI_CRAWLERS = [
  'GPTBot',           // OpenAI 학습
  'OAI-SearchBot',    // ChatGPT 검색
  'ChatGPT-User',     // ChatGPT 사용자 요청 페치
  'ClaudeBot',        // Anthropic
  'Claude-User',
  'PerplexityBot',
  'Google-Extended',  // Gemini / AI Overviews
  'Applebot-Extended',
  'Bingbot',
  'CCBot',            // Common Crawl
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/' },
      { userAgent: AI_CRAWLERS, allow: '/' },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
