import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Lock, Pin } from 'lucide-react';
import { getCurrentSession } from '@/actions/auth/get-current-session';
import { toggleForumPostLike } from '@/actions/forum/engagement';
import { LikeButton } from '@/components/advice/like-button';
import { ForumComments } from '@/components/forum/forum-comments';
import { ForumThreadActions } from '@/components/forum/forum-thread-actions';
import { PageTitle } from '@/components/ui/page-title';
import { StickyHeader } from '@/components/ui/sticky-header';
import { getForumPost } from '@/lib/forum';
import { nestComments, timeAgo } from '@/lib/forum-utils';
import { Markdown, plainText } from '@/lib/markdown';
import { MISSING_TAB_TITLE, tabTitle } from '@/lib/tab-title';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

export async function generateMetadata(props: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const post = await getForumPost((await props.params).id);
  if (!post) return { title: { absolute: MISSING_TAB_TITLE } };
  const text = plainText(post.content);
  const description = text.length > 160 ? `${text.slice(0, 157)}...` : text;
  return {
    title: tabTitle.cat('foro', post.title),
    description,
    openGraph: {
      title: post.title,
      description,
      url: `${SITE_URL}/foro/tema/${post.id}`,
      type: 'article',
      siteName: 'programaConNosotros',
    },
  };
}

export default async function ForumThreadPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const [session, post] = await Promise.all([getCurrentSession(), getForumPost(id)]);
  if (!post) notFound();

  const isAdmin = session?.user.role === 'ADMIN';
  const canEdit = !!session && (isAdmin || session.user.id === post.authorId);
  const edited = post.updatedAt.getTime() - post.createdAt.getTime() > 60_000;

  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <div className="mx-auto mt-4 w-full max-w-4xl">
        <StickyHeader>
          <PageTitle
            path={[
              { label: 'foro', href: '/foro' },
              { label: post.category.slug, href: `/foro/categoria/${post.category.slug}` },
              { label: post.id.slice(-7) },
            ]}
            meta={`${post.comments.length} ${post.comments.length === 1 ? 'respuesta' : 'respuestas'}`}
          />
        </StickyHeader>

        <article className="mb-8 border border-pcnGreen-200">
          <header className="flex flex-col gap-2 border-b border-dashed border-pcnGreen-200 p-4">
            <h2 className="flex items-start gap-2 text-xl font-semibold text-foreground">
              {post.isPinned && (
                <Pin className="mt-1.5 size-4 shrink-0 text-pcnGreen" aria-label="Fijado" />
              )}
              {post.isLocked && (
                <Lock
                  className="mt-1.5 size-4 shrink-0 text-muted-foreground"
                  aria-label="Cerrado"
                />
              )}
              {post.title}
            </h2>
            <p className="font-mono text-[11px] text-muted-foreground">
              <Link href={`/perfil/${post.author.id}`} className="text-pcnGreen hover:underline">
                @{post.author.name}
              </Link>{' '}
              en{' '}
              <Link
                href={`/foro/categoria/${post.category.slug}`}
                className="text-pcnGreen-600 hover:underline"
              >
                #{post.category.slug}
              </Link>{' '}
              · <time dateTime={post.createdAt.toISOString()}>{timeAgo(post.createdAt)}</time>
              {edited && ' · editado'}
            </p>
          </header>
          <div className="p-4">
            <Markdown content={post.content} />
          </div>
          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-dashed border-pcnGreen-200 px-4 py-2">
            <LikeButton
              adviceId={post.id}
              likes={post.likes}
              session={session}
              toggle={toggleForumPostLike}
            />
            <ForumThreadActions
              postId={post.id}
              canEdit={canEdit}
              isAdmin={isAdmin}
              isPinned={post.isPinned}
              isLocked={post.isLocked}
            />
          </footer>
        </article>

        <div className="mb-14">
          <ForumComments
            postId={post.id}
            comments={nestComments(post.comments)}
            total={post.comments.length}
            viewer={session ? { id: session.user.id, isAdmin } : null}
            isLocked={post.isLocked}
          />
        </div>
      </div>
    </div>
  );
}
