import type { Metadata } from 'next';
import { Navbar } from '@/components/shared/Navbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { UseCases } from '@/components/landing/UseCases';
import { FeatureGrid } from '@/components/landing/FeatureGrid';
import { ComparisonTable } from '@/components/landing/ComparisonTable';
import { Testimonials } from '@/components/landing/Testimonials';
import { FAQSection } from '@/components/landing/FAQSection';
import { Footer } from '@/components/landing/Footer';
import { getDictionary } from '@/dictionaries';
import { SITE_URL, SEO, getHreflangAlternates } from '@/lib/seo';
import { faqSchema, howToSchema, webSiteSchema } from '@/lib/structured-data';

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
    title,
    description,
    alternates: {
      canonical,
      languages: getHreflangAlternates(),
    },
    openGraph: {
      title,
      description,
      url: canonical,
    },
    twitter: { title, description },
  };
}

export default async function Home({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const rawDict = await getDictionary(lang);
  const dict = JSON.parse(JSON.stringify(rawDict));

  // FAQ·HowTo 구조화 데이터는 화면에 실제로 렌더되는 사전과 같은 소스를 쓴다 (내용 불일치 방지)
  const schemas = [
    webSiteSchema(lang),
    dict.faq?.items?.length ? faqSchema(dict.faq.items) : null,
    dict.howItWorks?.steps?.length
      ? howToSchema(dict.howItWorks.subtitle ?? 'How to remove an image background', dict.howItWorks.steps)
      : null,
  ].filter(Boolean);

  return (
    <div className="flex flex-col min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
      />
      <Navbar lang={lang} dict={dict} />
      <main className="flex-1">
        <HeroSection dict={dict} />
        <HowItWorks dict={dict} />
        <UseCases dict={dict} />
        <FeatureGrid dict={dict} />
        <ComparisonTable dict={dict} />
        <Testimonials dict={dict} />
        <FAQSection dict={dict} />
      </main>
      <Footer dict={dict} />
    </div>
  );
}
