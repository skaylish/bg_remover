import type { Metadata } from 'next';
import { Navbar } from '@/components/shared/Navbar';
import { PricingSection } from '@/components/landing/PricingSection';
import { Footer } from '@/components/landing/Footer';
import { getDictionary } from '@/dictionaries';
import { SITE_URL, SEO, getHreflangAlternates } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const seo = SEO[lang as keyof typeof SEO] ?? SEO.en;
  const { title, description } = seo.pricing;
  const canonical = `${SITE_URL}/${lang}/pricing`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: getHreflangAlternates('/pricing'),
    },
    openGraph: { title, description, url: canonical },
    twitter: { title, description },
  };
}

export default async function PricingPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const rawDict = await getDictionary(lang);
  const dict = JSON.parse(JSON.stringify(rawDict));

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar lang={lang} dict={dict} />
      <main className="flex-1 pt-20">
        <PricingSection dict={dict} />
      </main>
      <Footer dict={dict} />
    </div>
  );
}
