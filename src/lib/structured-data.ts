// schema.org JSON-LD 생성기 — 검색엔진 리치결과와 AI 검색엔진 인용 양쪽을 노린다
import { SITE_URL } from './seo';

const ORG_ID = `${SITE_URL}/#organization`;
const SITE_ID = `${SITE_URL}/#website`;

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORG_ID,
    name: 'BGRemover',
    url: SITE_URL,
    logo: `${SITE_URL}/icon.png`,
    email: 'dcbvcd@gmail.com',
    description:
      'BGRemover removes image backgrounds entirely inside the browser using an ONNX segmentation model, so images are never uploaded to a server.',
  };
}

export function webSiteSchema(lang: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': SITE_ID,
    name: 'BGRemover',
    url: `${SITE_URL}/${lang}`,
    inLanguage: lang,
    publisher: { '@id': ORG_ID },
  };
}

export function faqSchema(items: Array<{ q: string; a: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
}

// Google은 2023년에 HowTo 리치결과를 폐지했으나, AI 검색엔진의 절차 추출에는 여전히 유효하다.
export function howToSchema(
  name: string,
  steps: Array<{ title: string; description: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    step: steps.map(({ title, description }, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: title,
      text: description,
    })),
  };
}

export function breadcrumbSchema(
  lang: string,
  trail: Array<{ name: string; path: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map(({ name, path }, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name,
      item: `${SITE_URL}/${lang}${path}`,
    })),
  };
}
