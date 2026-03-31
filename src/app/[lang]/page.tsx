import { Navbar } from '@/components/shared/Navbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { UseCases } from '@/components/landing/UseCases';
import { FeatureGrid } from '@/components/landing/FeatureGrid';
import { ComparisonTable } from '@/components/landing/ComparisonTable';
import { Testimonials } from '@/components/landing/Testimonials';
import { Footer } from '@/components/landing/Footer';
import { getDictionary } from '@/dictionaries';

export default async function Home({
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
      <main className="flex-1">
        <HeroSection dict={dict} />
        <HowItWorks dict={dict} />
        <UseCases dict={dict} />
        <FeatureGrid dict={dict} />
        <ComparisonTable dict={dict} />
        <Testimonials dict={dict} />
      </main>
      <Footer dict={dict} />
    </div>
  );
}
