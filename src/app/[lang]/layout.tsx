import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Script from 'next/script';
import '../globals.css';
import { ModelPreloader } from '@/components/shared/ModelPreloader';
import { SITE_URL, SEO, getHreflangAlternates } from '@/lib/seo';

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
  const canonical = `${SITE_URL}/${lang}`;

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: title,
      template: '%s | BGRemover',
    },
    description,
    alternates: {
      canonical,
      languages: getHreflangAlternates(),
    },
    openGraph: {
      title,
      description,
      url: canonical,
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

  return (
    <html
      lang={lang}
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className="min-h-full flex flex-col"
        style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}
      >
        <ModelPreloader />
        {children}
        {lang === 'ko' && <Script src="https://js.tosspayments.com/v2/standard" strategy="lazyOnload" />}
      </body>
    </html>
  );
}
