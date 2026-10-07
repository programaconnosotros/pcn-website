import Link from 'next/link';
import { Heart, Lock, MessageSquare, Pin } from 'lucide-react';
import type { ForumPostSummary } from '@/lib/forum';
import { timeAgo } from '@/lib/forum-utils';

// Threads as ruled rows, like a mailing-list index: title, category and who started it, then
// replies, likes and last activity.
export function ForumPostList({
  posts,
  showCategory = true,
}: {
  posts: ForumPostSummary[];
  showCategory?: boolean;
}) {
  if (posts.length === 0) {
    return (
      <p className="self-start border border-pcnGreen-200 p-4 font-mono text-xs text-muted-foreground">
        <span className="text-pcnGreen-500">$ ls: </span>todavía no hay temas. ¡Abrí el primero!
      </p>
    );
  }

  return (
    <ol className="self-start border border-pcnGreen-200">
      {posts.map((post) => (
        <li
          key={post.id}
          className="border-b border-pcnGreen-200 transition-colors last:border-b-0 hover:bg-pcnGreen/[0.04]"
        >
          <Link
            href={`/foro/tema/${post.id}`}
            className="flex flex-col gap-1 px-3 py-2.5 sm:flex-row sm:items-center sm:gap-4"
          >
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="flex items-center gap-1.5 text-sm text-foreground">
                {post.isPinned && (
                  <Pin className="size-3 shrink-0 text-pcnGreen" aria-label="Fijado" />
                )}
                {post.isLocked && (
                  <Lock className="size-3 shrink-0 text-muted-foreground" aria-label="Cerrado" />
                )}
                <span className="truncate">{post.title}</span>
              </span>
              <span className="font-mono text-[11px] text-muted-foreground">
                {showCategory && <span className="text-pcnGreen-600">#{post.category.slug} </span>}
                por @{post.author.name}
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-3 font-mono text-[11px] text-muted-foreground">
              <span
                className="flex items-center gap-1"
                title={`${post._count.comments} respuestas`}
              >
                <MessageSquare className="size-3" aria-hidden />
                {post._count.comments}
                <span className="sr-only"> respuestas</span>
              </span>
              <span className="flex items-center gap-1" title={`${post._count.likes} me gusta`}>
                <Heart className="size-3" aria-hidden />
                {post._count.likes}
                <span className="sr-only"> me gusta</span>
              </span>
              <time dateTime={new Date(post.activeAt).toISOString()} className="w-24 text-right">
                {timeAgo(post.activeAt)}
              </time>
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
