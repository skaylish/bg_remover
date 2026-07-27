import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Geist, Geist_Mono } from 'next/font/google';
import '../globals.css';
import { Analytics } from '@/components/shared/Analytics';
import { ModelPreloader } from '@/components/shared/ModelPreloader';
import { SITE_URL, SEO, SUPPORTED_LANGS, type SupportedLang } from '@/lib/seo';
import { organizationSchema } from '@/lib/structured-data';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const seo = SEO[lang as keyof typeof SEO] ?? SEO.en;
  const { title, description } = seo.home;

  // canonical/hreflang은 각 페이지의 generateMetadata에서 개별 설정한다.
  // (layout에서 설정하면 하위 페이지가 상속받아 모두 홈을 표준으로 선언하는 버그 발생)
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: title,
      template: '%s | BGRemover',
    },
    description,
    openGraph: {
      title,
      description,
      siteName: 'BGRemover',
      type: 'website',
      locale: lang,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
  };
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'BGRemover',
  url: SITE_URL,
  description: 'AI-powered background removal that runs 100% in your browser. Images never uploaded to any server.',
  applicationCategory: 'DesignApplication',
  operatingSystem: 'Web',
  browserRequirements: 'Requires JavaScript. WebGPU or WASM support recommended.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    description: 'Free low-resolution background removal, forever.',
  },
  featureList: [
    '100% local processing, no server upload',
    'AI-powered background removal',
    'Batch background removal',
    'Custom background replacement',
    'High-resolution download',
  ],
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  // [lang]은 어떤 세그먼트든 잡으므로 /ads.txt 같은 경로가 lang="ads.txt"인 홈페이지로 200 응답되던 문제.
  // Google이 소프트 404를 중복 페이지로 취급하므로 지원 언어가 아니면 명시적으로 404를 낸다.
  if (!SUPPORTED_LANGS.includes(lang as SupportedLang)) notFound();

  return (
    <html
      lang={lang}
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify([jsonLd, organizationSchema()]) }}
        />
      </head>
      <body
        className="min-h-full flex flex-col"
        style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}
      >
        <ModelPreloader />
        {children}
      </body>
      <Analytics />
    </html>
  );
}
