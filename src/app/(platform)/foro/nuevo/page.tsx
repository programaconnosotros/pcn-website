import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/actions/auth/get-current-session';
import { ForumPostForm } from '@/components/forum/forum-post-form';
import { PageTitle } from '@/components/ui/page-title';
import { listForumCategories } from '@/lib/forum';
import { tabTitle } from '@/lib/tab-title';

export const metadata: Metadata = { title: tabTitle.ls('foro/nuevo') };

export default async function NewForumPostPage(props: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  const [session, categories, { categoria }] = await Promise.all([
    getCurrentSession(),
    listForumCategories(),
    props.searchParams,
  ]);
  if (!session) redirect('/autenticacion/iniciar-sesion?redirect=/foro/nuevo');

  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <div className="mx-auto mt-4 w-full max-w-3xl">
        <PageTitle
          path={[{ label: 'foro', href: '/foro' }, { label: 'nuevo' }]}
          meta="abrí un tema para la comunidad"
        />
        <ForumPostForm
          categories={categories}
          defaultCategoryId={categories.find((c) => c.slug === categoria)?.id}
        />
      </div>
    </div>
  );
}
