'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CornerDownRight, Trash } from 'lucide-react';
import { toast } from 'sonner';
import { createForumComment, deleteForumComment } from '@/actions/forum/engagement';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { timeAgo, type ForumCommentNode } from '@/lib/forum-utils';
import { Markdown } from '@/lib/markdown';
import { actionErrorMessage } from '@/lib/rate-limit-messages';

type Viewer = { id: string; isAdmin: boolean } | null;

/** Replies nest this deep; deeper answers stay at the last level. */
const MAX_DEPTH = 3;

function ReplyForm({
  postId,
  parentCommentId,
  onDone,
  autoFocus,
}: {
  postId: string;
  parentCommentId: string | null;
  onDone?: () => void;
  autoFocus?: boolean;
}) {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [isPending, startTransition] = useTransition();

  const submit = () =>
    startTransition(async () => {
      try {
        await createForumComment(postId, { content, parentCommentId });
        setContent('');
        onDone?.();
        router.refresh();
      } catch (error) {
        toast.error(actionErrorMessage(error, 'No se pudo publicar la respuesta'));
      }
    });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
      className="flex flex-col gap-2"
    >
      <Textarea
        aria-label={parentCommentId ? 'Tu respuesta al comentario' : 'Tu respuesta'}
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="Escribí tu respuesta (admite markdown)..."
        maxLength={5000}
        autoFocus={autoFocus}
        className="min-h-20 font-mono text-xs"
      />
      <div className="flex justify-end gap-2">
        {onDone && (
          <Button type="button" variant="ghost" size="sm" onClick={onDone}>
            cancelar();
          </Button>
        )}
        <Button
          type="submit"
          variant="pcn"
          size="sm"
          disabled={!content.trim()}
          loading={isPending}
          loadingText="enviando..."
        >
          responder();
        </Button>
      </div>
    </form>
  );
}

function Comment({
  comment,
  postId,
  viewer,
  canReply,
  depth,
}: {
  comment: ForumCommentNode;
  postId: string;
  viewer: Viewer;
  canReply: boolean;
  depth: number;
}) {
  const router = useRouter();
  const [replying, setReplying] = useState(false);
  const [isPending, startTransition] = useTransition();
  const canDelete = !!viewer && (viewer.isAdmin || viewer.id === comment.authorId);

  const remove = () =>
    startTransition(async () => {
      try {
        await deleteForumComment(comment.id);
        router.refresh();
      } catch (error) {
        toast.error(actionErrorMessage(error, 'No se pudo borrar el comentario'));
      }
    });

  return (
    <li className="flex flex-col gap-2">
      <article className="border-l-2 border-pcnGreen-200 pl-3">
        <header className="flex flex-wrap items-center gap-x-2 font-mono text-[11px] text-muted-foreground">
          <Link href={`/perfil/${comment.author.id}`} className="text-pcnGreen hover:underline">
            @{comment.author.name}
          </Link>
          <time dateTime={new Date(comment.createdAt).toISOString()}>
            {timeAgo(comment.createdAt)}
          </time>
          <span className="ml-auto flex items-center gap-3">
            {canReply && viewer && (
              <button
                type="button"
                onClick={() => setReplying((open) => !open)}
                className="flex items-center gap-1 hover:text-pcnGreen"
              >
                <CornerDownRight className="size-3" aria-hidden />
                responder
              </button>
            )}
            {canDelete && (
              <button
                type="button"
                onClick={remove}
                disabled={isPending}
                className="flex items-center gap-1 hover:text-red-400 disabled:opacity-50"
              >
                <Trash className="size-3" aria-hidden />
                borrar
              </button>
            )}
          </span>
        </header>
        <Markdown
          content={comment.content}
          className="mt-1 flex flex-col gap-2 text-sm leading-relaxed text-foreground/90"
        />
      </article>
      {replying && (
        <div className="pl-5">
          <ReplyForm
            postId={postId}
            parentCommentId={depth < MAX_DEPTH ? comment.id : comment.parentCommentId}
            onDone={() => setReplying(false)}
            autoFocus
          />
        </div>
      )}
      {comment.replies.length > 0 && (
        <ol className="flex flex-col gap-3 pl-5">
          {comment.replies.map((reply) => (
            <Comment
              key={reply.id}
              comment={reply}
              postId={postId}
              viewer={viewer}
              canReply={canReply}
              depth={depth + 1}
            />
          ))}
        </ol>
      )}
    </li>
  );
}

/** A thread's replies, nested, with the form to answer at the end. */
export function ForumComments({
  postId,
  comments,
  total,
  viewer,
  isLocked,
}: {
  postId: string;
  comments: ForumCommentNode[];
  total: number;
  viewer: Viewer;
  isLocked: boolean;
}) {
  return (
    <section aria-labelledby="forum-replies" className="flex flex-col gap-4">
      <h2
        id="forum-replies"
        className="font-mono text-xs tracking-wider text-muted-foreground uppercase"
      >
        {'// '}
        {total} {total === 1 ? 'respuesta' : 'respuestas'}
      </h2>
      {comments.length > 0 && (
        <ol className="flex flex-col gap-4">
          {comments.map((comment) => (
            <Comment
              key={comment.id}
              comment={comment}
              postId={postId}
              viewer={viewer}
              canReply={!isLocked}
              depth={1}
            />
          ))}
        </ol>
      )}
      {isLocked ? (
        <p className="border border-dashed border-pcnGreen-200 p-3 font-mono text-xs text-muted-foreground">
          <span className="text-pcnGreen-500">$ </span>Este tema está cerrado: no admite respuestas
          nuevas.
        </p>
      ) : viewer ? (
        <ReplyForm postId={postId} parentCommentId={null} />
      ) : (
        <p className="font-mono text-xs text-muted-foreground">
          <Link
            href={`/autenticacion/iniciar-sesion?redirect=/foro/tema/${postId}`}
            className="text-pcnGreen hover:underline"
          >
            Iniciá sesión
          </Link>{' '}
          para responder.
        </p>
      )}
    </section>
  );
}
