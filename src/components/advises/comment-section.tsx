'use client';

import { createComment } from '@/actions/comments/create-comment';
import { formatDate } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Session, User } from '@prisma/client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';

const commentSchema = z.object({
  content: z
    .string()
    .min(1, { message: 'El comentario no puede estar vacío' })
    .max(500, { message: 'El comentario no puede tener más de 500 caracteres' }),
});

type CommentFormData = z.infer<typeof commentSchema>;

type CommentToDisplay = {
  id: string;
  content: string;
  createdAt: Date;
  author: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
  replies: CommentToDisplay[];
};

type CommentSectionProps = {
  adviseId: string;
  comments: CommentToDisplay[];
  session: (Session & { user: User }) | null;
};

export const CommentSection = ({ adviseId, comments, session }: CommentSectionProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

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
        parentCommentId: replyingTo,
      });

      reset();
      setReplyingTo(null);

      toast.success('Comentario creado');
    } catch (error) {
      toast.error('Error al crear el comentario');
    } finally {
      setIsSubmitting(false);
    }
  };

  const Comment = ({ comment }: { comment: CommentToDisplay }) => (
    <div className="space-y-4">
      <div className="flex items-start gap-4">
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.author.image ?? undefined} alt={comment.author.name} />
          <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{comment.author.name}</span>
            <span className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</span>
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

      {comment.replies.length > 0 && (
        <div className="ml-8 space-y-4 border-l pl-4">
          {comment.replies.map((reply) => (
            <Comment key={reply.id} comment={reply} />
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
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Enviando...' : 'Enviar respuesta'}
              </Button>

              <Button
                type="button"
                variant="ghost"
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
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Comentarios</h2>

      {session ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Textarea
            {...register('content')}
            placeholder="Escribe tu comentario..."
            className="min-h-[100px] resize-none"
          />

          {errors.content && <p className="text-sm text-destructive">{errors.content.message}</p>}

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Enviando...' : 'Enviar comentario'}
          </Button>
        </form>
      ) : (
        <p className="text-sm text-muted-foreground">Debes iniciar sesión para poder comentar.</p>
      )}

      <div className="space-y-6">
        {comments.map((comment) => (
          <Comment key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  );
};
