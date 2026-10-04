'use client';

import { toggleLike } from '@/actions/advises/like-advise';
import type { SessionWithUser } from '@/lib/session';
import { cn } from '@/lib/utils';
import { actionErrorMessage } from '@/lib/rate-limit-messages';
import { Heart } from 'lucide-react';
import { startTransition, useOptimistic, useState } from 'react';
import { toast } from 'sonner';

type LikeRef = { userId: string };

// Optimistic like toggle for a published consejo, drawn as a compact mono counter.
export function LikeButton({
  adviseId,
  likes,
  session,
  className,
}: {
  adviseId: string;
  likes: LikeRef[];
  session: SessionWithUser | null;
  className?: string;
}) {
  const [isLiking, setIsLiking] = useState(false);
  const [optimisticLikes, toggleOptimisticLike] = useOptimistic(
    likes,
    (state: LikeRef[], userId: string) =>
      state.some((like) => like.userId === userId)
        ? state.filter((like) => like.userId !== userId)
        : [...state, { userId }],
  );

  const userId = session?.user?.id;
  const isLiked = userId ? optimisticLikes.some((like) => like.userId === userId) : false;

  const handleLike = async () => {
    if (!userId) {
      toast.info('Iniciá sesión para dar me gusta');
      return;
    }
    if (isLiking) return;

    setIsLiking(true);
    // El cambio optimista va dentro de una transición: fuera de una, React lo descarta y el
    // corazón no cambia hasta que responde el servidor. Si la action falla, al terminar la
    // transición vuelve solo al estado real.
    startTransition(async () => {
      toggleOptimisticLike(userId);
      try {
        await toggleLike(adviseId);
      } catch (error) {
        console.error('Error toggling like:', error);
        toast.error(actionErrorMessage(error, 'No se pudo guardar el me gusta'));
      } finally {
        setIsLiking(false);
      }
    });
  };

  return (
    <button
      type="button"
      aria-pressed={isLiked}
      title={isLiked ? 'Quitar me gusta' : 'Me gusta'}
      className={cn(
        'relative z-10 flex h-6 items-center gap-1 rounded-sm border px-1.5 font-mono text-[11px] tabular-nums transition-colors',
        isLiked
          ? 'border-red-500/40 bg-red-500/10 text-red-500 hover:text-red-400'
          : 'border-transparent text-muted-foreground hover:border-red-500/30 hover:text-red-500',
        className,
      )}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleLike();
      }}
    >
      <Heart className="size-3.5" fill={isLiked ? 'currentColor' : 'none'} />
      {optimisticLikes.length}
      <span className="sr-only">Me gusta</span>
    </button>
  );
}
