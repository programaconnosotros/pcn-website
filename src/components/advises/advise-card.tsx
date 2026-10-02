'use client';

import { toggleLike } from '@/actions/advises/like-advise';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ruledCellClassName } from '@/components/ui/ruled-grid';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn, formatDate } from '@/lib/utils';
import { Advise, User, Like } from '@prisma/client';
import type { SessionWithUser } from '@/lib/session';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Edit, Heart, MoreVertical, Trash } from 'lucide-react';
import Link from 'next/link';
import { useOptimistic, useState } from 'react';
import { DeleteAdviseDialog } from './delete-advise-dialog';
import { EditAdviseDialog } from './edit-advise-dialog';

export const AdviseCard = ({
  advise,
  session,
  className,
  showAuthor = true,
}: {
  className?: string;
  /** Off where every card is by the same person, like their own profile. */
  showAuthor?: boolean;
  advise: Advise & {
    author: Pick<User, 'id' | 'name' | 'image'>;
    likes: Like[];
  };
  session: SessionWithUser | null;
}) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  // Initialize optimistic state with the current likes
  const [optimisticLikes, addOptimisticLike] = useOptimistic(
    advise.likes,
    (state: Like[], userId: string) => {
      const isLiked = state.some((like) => like.userId === userId);

      return isLiked
        ? state.filter((like) => like.userId !== userId)
        : [
            ...state,
            { userId, id: '', createdAt: new Date(), updatedAt: new Date(), adviseId: '' },
          ];
    },
  );

  const isAuthor = !!session?.user?.id && session.user.id === advise.author.id;

  const isAdmin = session?.user?.role === 'ADMIN';

  const canEditOrDelete = isAuthor || isAdmin;

  const isLiked = session?.user?.id
    ? optimisticLikes.some((like) => like.userId === session.user.id)
    : false;

  const handleLike = async () => {
    if (!session?.user?.id || isLiking) return;

    setIsLiking(true);
    const _previousLikes = [...optimisticLikes];

    try {
      // Optimistically update the UI
      addOptimisticLike(session.user.id);
      await toggleLike(advise.id);
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert optimistic update on error
      addOptimisticLike(session.user.id);
    } finally {
      setIsLiking(false);
    }
  };

  const Options = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <MoreVertical className="h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
          <Edit className="mr-2 h-4 w-4" />
          <span>Editar</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)}>
          <Trash className="mr-2 h-4 w-4" />
          <span>Eliminar</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <article className={cn(ruledCellClassName, 'group/advise flex flex-col gap-4 p-4', className)}>
      <Link
        href={`/consejos/${advise.id}`}
        className="relative flex-1 border-l-2 border-pcnGreen-200 pl-4 pr-6 text-[15px] leading-relaxed text-foreground/90 transition-colors hover:text-foreground group-hover/advise:border-pcnGreen-500"
      >
        <span
          aria-hidden
          className="absolute -top-1 right-0 font-serif text-4xl leading-none text-pcnGreen/15"
        >
          &rdquo;
        </span>
        {advise.content}
      </Link>

      <footer className="flex items-center gap-2">
        {showAuthor && (
          <Link
            href={`/perfil/${advise.author.id}`}
            className="group/author flex min-w-0 items-center gap-2"
          >
            <Avatar className="h-6 w-6 rounded-sm">
              <AvatarImage
                src={advise.author.image ?? undefined}
                alt={advise.author.name ?? undefined}
              />
              <AvatarFallback className="rounded-sm text-[10px]">
                {advise.author?.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="truncate font-mono text-xs font-semibold transition-colors group-hover/author:text-pcnGreen">
              {advise.author.name}
            </span>
          </Link>
        )}

        <time
          dateTime={new Date(advise.createdAt).toISOString()}
          title={formatDate(advise.createdAt)}
          className={cn(
            'shrink-0 font-mono text-[11px] text-muted-foreground',
            showAuthor && 'hidden sm:inline',
          )}
          suppressHydrationWarning
        >
          {showAuthor && <span className="text-pcnGreen-500/60">· </span>}
          {format(advise.createdAt, 'd MMM yyyy', { locale: es })}
        </time>

        <div className="ml-auto flex shrink-0 items-center gap-1">
          <button
            type="button"
            aria-pressed={isLiked}
            className={cn(
              'flex items-center gap-1 rounded-sm border px-1.5 py-0.5 font-mono text-[11px] tabular-nums transition-colors',
              isLiked
                ? 'border-red-500/40 bg-red-500/10 text-red-500 hover:text-red-400'
                : 'border-transparent text-muted-foreground hover:border-red-500/30 hover:text-red-500',
            )}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleLike();
            }}
          >
            <Heart className="h-3.5 w-3.5" fill={isLiked ? 'currentColor' : 'none'} />
            {optimisticLikes.length}
            <span className="sr-only">Me gusta</span>
          </button>
          {canEditOrDelete && Options}
        </div>
      </footer>

      <DeleteAdviseDialog
        adviseId={advise.id}
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      />

      <EditAdviseDialog
        adviseId={advise.id}
        initialContent={advise.content}
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
    </article>
  );
};
