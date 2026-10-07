'use client';

import { createComment } from '@/actions/comments/create-comment';
import { formatDate } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { User } from '@/generated/prisma/browser';
import type { SessionWithUser } from '@/lib/session';

type Author = Pick<User, 'id' | 'name' | 'image'>;
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

const commentSchema = z.object({
  content: z
    .string()
    .min(1, { message: 'El comentario no puede estar vacío' })
    .max(500, { message: 'El comentario no puede tener más de 500 caracteres' }),
});

type CommentFormData = z.infer<typeof commentSchema>;

type CommentSectionProps = {
  adviseId: string;
  comments: (Comment & { author: Author; replies: (Comment & { author: Author })[] })[];
  session: SessionWithUser | null;
};

export const CommentSection = ({ adviseId, comments, session }: CommentSectionProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
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
        adviseId,
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
    comment: Comment & {
      author: Author;
      replies?: (Comment & { author: Author; replies?: any[] })[];
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
            </span>
          </div>

          <p className="text-sm">{comment.content}</p>

          {session && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setReplyingTo(comment.id)}
              className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
            >
              Responder
            </Button>
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
    <div className="divide-y divide-pcnGreen-200 border-b border-r border-pcnGreen-200">
      <h2 className="px-3 py-2 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
        <span className="text-pcnGreen-500">{'// '}</span>
        comentarios
      </h2>

      {session ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2 p-3">
          <Textarea
            {...register('content')}
            placeholder="Escribe tu comentario..."
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
          <Link href="/autenticacion/iniciar-sesion" className="underline hover:text-foreground">
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
    </div>
  );
};
