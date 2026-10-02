'use client';

import { useOptimistic, useTransition } from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';
import { toggleSetupLike } from '@/actions/setups/setup-actions';
import { actionErrorMessage } from '@/lib/rate-limit-messages';
import { cn } from '@/lib/utils';

interface SetupLikeButtonProps {
  setupId: string;
  likes: number;
  liked: boolean;
  /** Without a session the button sends to the login and back. */
  isLoggedIn: boolean;
  className?: string;
}

const buttonClassName =
  'flex items-center gap-1 rounded-sm border px-1.5 py-0.5 font-mono text-[11px] tabular-nums transition-colors';
const idleClassName =
  'border-transparent text-muted-foreground hover:border-red-500/30 hover:text-red-500';

export function SetupLikeButton({
  setupId,
  likes,
  liked,
  isLoggedIn,
  className,
}: SetupLikeButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [optimistic, toggleOptimistic] = useOptimistic({ likes, liked }, (state) => ({
    liked: !state.liked,
    likes: state.likes + (state.liked ? -1 : 1),
  }));

  if (!isLoggedIn) {
    return (
      <Link
        href={`/autenticacion/iniciar-sesion?redirect=/setups/${setupId}`}
        title="Iniciá sesión para dar me gusta"
        className={cn(buttonClassName, idleClassName, className)}
      >
        <Heart className="size-3.5" />
        {likes}
        <span className="sr-only">Me gusta</span>
      </Link>
    );
  }

  return (
    <button
      type="button"
      aria-pressed={optimistic.liked}
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          toggleOptimistic(null);
          try {
            await toggleSetupLike(setupId);
          } catch (error) {
            toast.error(actionErrorMessage(error, 'No se pudo guardar el me gusta'));
          }
        })
      }
      className={cn(
        buttonClassName,
        optimistic.liked
          ? 'border-red-500/40 bg-red-500/10 text-red-500 hover:text-red-400'
          : idleClassName,
        className,
      )}
    >
      <Heart className="size-3.5" fill={optimistic.liked ? 'currentColor' : 'none'} />
      {optimistic.likes}
      <span className="sr-only">Me gusta</span>
    </button>
  );
}
