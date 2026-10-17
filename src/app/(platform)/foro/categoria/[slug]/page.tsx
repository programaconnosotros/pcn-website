import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ForumIndex } from '@/components/forum/forum-index';
import { listForumCategories } from '@/lib/forum';
import { MISSING_TAB_TITLE, tabTitle } from '@/lib/tab-title';

const findCategory = async (slug: string) =>
  (await listForumCategories()).find((category) => category.slug === slug);

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const category = await findCategory((await props.params).slug);
  if (!category) return { title: { absolute: MISSING_TAB_TITLE } };
  return { title: tabTitle.ls(`foro/${category.slug}`), description: category.description };
}

export default async function ForoCategoryPage(props: { params: Promise<{ slug: string }> }) {
  const category = await findCategory((await props.params).slug);
  if (!category) notFound();
  return <ForumIndex category={category} />;
}
