import type { Metadata } from 'next';
import { EditorLayout } from '@/components/editor/EditorLayout';
import { getDictionary } from '@/dictionaries';
import { SITE_URL, SEO, getHreflangAlternates } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const seo = SEO[lang as keyof typeof SEO] ?? SEO.en;
  const { title, description } = seo.editor;
  const canonical = `${SITE_URL}/${lang}/editor`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: getHreflangAlternates('/editor'),
    },
    openGraph: { title, description, url: canonical },
    twitter: { title, description },
  };
}

export default async function EditorPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const rawDict = await getDictionary(lang);
  const dict = JSON.parse(JSON.stringify(rawDict));

  return <EditorLayout dict={dict} />;
}
