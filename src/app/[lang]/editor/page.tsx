import { EditorLayout } from '@/components/editor/EditorLayout';
import { getDictionary } from '@/dictionaries';

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
