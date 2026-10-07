import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getCurrentSession } from '@/actions/auth/get-current-session';
import { ForumPostForm } from '@/components/forum/forum-post-form';
import { PageTitle } from '@/components/ui/page-title';
import { getForumPost, listForumCategories } from '@/lib/forum';
import { tabTitle } from '@/lib/tab-title';

export const metadata: Metadata = { title: tabTitle.ls('foro/editar') };

export default async function EditForumPostPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const [session, post, categories] = await Promise.all([
    getCurrentSession(),
    getForumPost(id),
    listForumCategories(),
  ]);
  if (!post) notFound();
  if (!session) redirect(`/autenticacion/iniciar-sesion?redirect=/foro/tema/${id}/editar`);
  if (session.user.id !== post.authorId && session.user.role !== 'ADMIN') {
    redirect(`/foro/tema/${id}`);
  }

  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <div className="mx-auto mt-4 w-full max-w-3xl">
        <PageTitle
          path={[
            { label: 'foro', href: '/foro' },
            { label: post.id.slice(-7), href: `/foro/tema/${post.id}` },
            { label: 'editar' },
          ]}
        />
        <ForumPostForm
          categories={categories}
          post={{
            id: post.id,
            title: post.title,
            categoryId: post.categoryId,
            content: post.content,
          }}
        />
      </div>
    </div>
  );
}
