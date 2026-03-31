import { Navbar } from '@/components/shared/Navbar';
import { PricingSection } from '@/components/landing/PricingSection';
import { Footer } from '@/components/landing/Footer';
import { getDictionary } from '@/dictionaries';

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
