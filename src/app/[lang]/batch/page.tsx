import { Navbar } from '@/components/shared/Navbar';
import { BatchEditor } from '@/components/batch/BatchEditor';
import { getDictionary } from '@/dictionaries';

export default async function BatchPage({
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
      <main className="flex-1 pt-16">
        <BatchEditor />
      </main>
    </div>
  );
}
