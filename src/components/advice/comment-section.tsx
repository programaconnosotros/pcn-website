'use client';

import { createComment } from '@/actions/comments/create-comment';
import { editComment } from '@/actions/comments/edit-comment';
import { formatDate } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { User } from '@/generated/prisma/browser';
import type { SessionWithUser } from '@/lib/session';

type Author = Pick<User, 'id' | 'name' | 'image'>;
/** Who liked a comment. */
type Likes = { likes?: { userId: string }[] };
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import Link from 'next/link';
import { Comment } from '@/generated/prisma/browser';
import { actionErrorMessage } from '@/lib/rate-limit-messages';
import { toggleCommentLike } from '@/actions/comments/toggle-comment-like';
import { DeleteCommentDialog } from './delete-comment-dialog';
import { LikeButton } from './like-button';

const commentSchema = z.object({
  content: z
    .string()
    .min(1, { message: 'El comentario no puede estar vacío' })
    .max(500, { message: 'El comentario no puede tener más de 500 caracteres' }),
});

type CommentFormData = z.infer<typeof commentSchema>;

type CommentSectionProps = {
  adviceId: string;
  comments: (Comment &
    Likes & { author: Author; replies: (Comment & Likes & { author: Author })[] })[];
  session: SessionWithUser | null;
  /** Who published the consejo, if a member did: they can delete any comment on it. */
  consejoAuthorId?: string;
};

/** A comment that changed after it was posted (Prisma bumps updatedAt only on edits). */
const wasEdited = (comment: Pick<Comment, 'createdAt' | 'updatedAt'>) =>
  new Date(comment.updatedAt).getTime() - new Date(comment.createdAt).getTime() > 1000;

// Lives outside CommentSection: the comment tree there re-mounts on every render, and this keeps
// what you're typing.
const EditCommentForm = ({
  commentId,
  content,
  onDone,
}: {
  commentId: string;
  content: string;
  onDone: () => void;
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
    defaultValues: { content },
  });

  const onSubmit = async (data: CommentFormData) => {
    setIsSaving(true);
    try {
      await editComment({ commentId, content: data.content });
      toast.success('Comentario editado');
      onDone();
    } catch (error) {
      toast.error(actionErrorMessage(error, 'Error al editar el comentario'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
      <Textarea
        {...register('content')}
        aria-label="Editar comentario"
        className="min-h-[72px] resize-none"
        autoFocus
      />
      {errors.content && <p className="text-sm text-destructive">{errors.content.message}</p>}
      <div className="flex gap-2">
        <Button type="submit" size="sm" loading={isSaving} loadingText="guardando...">
          guardar();
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onDone} disabled={isSaving}>
          Cancelar
        </Button>
      </div>
    </form>
  );
};

export const CommentSection = ({
  adviceId,
  comments,
  session,
  consejoAuthorId,
}: CommentSectionProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const isAdmin = session?.user?.role === 'ADMIN';
  // Quien publicó el consejo modera sus comentarios, igual que un admin.
  const canModerate = isAdmin || (!!consejoAuthorId && consejoAuthorId === session?.user?.id);
  // De cada respuesta, el comentario que abre su hilo
  const threadOf = new Map(
    comments.flatMap((comment) => comment.replies.map((reply) => [reply.id, comment.id] as const)),
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
  });

  const onSubmit = async (data: CommentFormData) => {
    if (!session) {
      toast.error('Debes iniciar sesión para comentar');
      return;
    }

    setIsSubmitting(true);
    try {
      await createComment({
        content: data.content,
        adviceId,
        // Los hilos tienen dos niveles: responder una respuesta la suma al mismo hilo
        parentCommentId: replyingTo ? (threadOf.get(replyingTo) ?? replyingTo) : null,
      });

      reset();
      setReplyingTo(null);

      toast.success('Comentario creado');
    } catch (error) {
      toast.error(actionErrorMessage(error, 'Error al crear el comentario'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const Comment = ({
    comment,
  }: {
    comment: Comment &
      Likes & {
        author: Author;
        replies?: (Comment & Likes & { author: Author; replies?: any[] })[];
      };
  }) => (
    <div className="space-y-3">
      <div className="flex items-start gap-2">
        <Avatar className="h-6 w-6 rounded-sm">
          <AvatarImage src={comment.author.image ?? undefined} alt={comment.author.name} />
          <AvatarFallback className="rounded-sm text-[10px]">
            {comment.author.name.charAt(0)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2 font-mono">
            <span className="text-xs font-semibold">{comment.author.name}</span>
            <span className="text-[11px] text-muted-foreground">
              {formatDate(comment.createdAt)}
              {wasEdited(comment) && ' (editado)'}
            </span>
            <LikeButton
              adviceId={comment.id}
              likes={comment.likes ?? []}
              session={session}
              toggle={toggleCommentLike}
              className="ml-auto"
            />
          </div>

          {editingId === comment.id ? (
            <EditCommentForm
              commentId={comment.id}
              content={comment.content}
              onDone={() => setEditingId(null)}
            />
          ) : (
            <p className="text-sm">{comment.content}</p>
          )}

          {session && editingId !== comment.id && (
            <div className="flex gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplyingTo(comment.id)}
                className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
              >
                Responder
              </Button>
              {comment.authorId === session.user.id && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingId(comment.id)}
                  className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                >
                  Editar
                </Button>
              )}
              {(comment.authorId === session.user.id || canModerate) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeletingId(comment.id)}
                  className="h-auto p-0 text-xs text-muted-foreground hover:text-destructive"
                >
                  Eliminar
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {!!comment.replies?.length && (
        <div className="ml-3 space-y-3 border-l border-pcnGreen-200 pl-5">
          {comment.replies.map((reply) => (
            <Comment key={reply.id} comment={{ ...reply, replies: [] }} />
          ))}
        </div>
      )}

      {replyingTo === comment.id && (
        <div className="ml-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Textarea
              {...register('content')}
              placeholder="Escribe tu respuesta..."
              className="min-h-[100px] resize-none"
            />
            {errors.content && <p className="text-sm text-destructive">{errors.content.message}</p>}

            <div className="flex gap-2">
              <Button type="submit" size="sm" loading={isSubmitting} loadingText="enviando...">
                enviarRespuesta();
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setReplyingTo(null)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );

  return (
    <div className="divide-y divide-pcnGreen-200 border-r border-b border-pcnGreen-200">
      <h2 className="px-3 py-2 font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">
        <span className="text-pcnGreen-500">{'// '}</span>
        comentarios
      </h2>

      {session ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2 p-3">
          <Textarea
            {...register('content')}
            placeholder="Escribí acá tu comentario"
            className="min-h-[72px] resize-none"
          />

          {errors.content && <p className="text-sm text-destructive">{errors.content.message}</p>}

          <Button type="submit" size="sm" loading={isSubmitting} loadingText="enviando...">
            enviarComentario();
          </Button>
        </form>
      ) : (
        <p className="p-3 text-sm text-muted-foreground">
          Debes{' '}
          <Link href="/iniciar-sesion" className="underline hover:text-foreground">
            iniciar sesión
          </Link>{' '}
          para poder comentar.
        </p>
      )}

      {comments.map((comment) => (
        <div key={comment.id} className="p-3">
          <Comment comment={comment} />
        </div>
      ))}

      <DeleteCommentDialog
        commentId={deletingId}
        hasReplies={!!comments.find((comment) => comment.id === deletingId)?.replies.length}
        onClose={() => setDeletingId(null)}
      />
    </div>
  );
};
