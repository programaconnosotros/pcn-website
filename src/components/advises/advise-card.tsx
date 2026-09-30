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
import { Advise, Session, User, Like } from '@prisma/client';
import { Edit, Heart, MoreVertical, Trash } from 'lucide-react';
import Link from 'next/link';
import { useOptimistic, useState } from 'react';
import { DeleteAdviseDialog } from './delete-advise-dialog';
import { EditAdviseDialog } from './edit-advise-dialog';

export const AdviseCard = ({
  advise,
  session,
  className,
}: {
  className?: string;
  advise: Advise & {
    author: Pick<User, 'id' | 'name' | 'image' | 'email'>;
    likes: Like[];
  };
  session: (Session & { user: User }) | null;
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

  const isAuthor =
    (session?.user?.id && session.user.id === advise.author.id) ||
    (session?.user?.email && session.user.email === advise.author.email);

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
    <div className={cn(ruledCellClassName, 'flex flex-col gap-2 p-3', className)}>
      <div className="flex items-center gap-2">
        <Avatar className="h-7 w-7 rounded-sm">
          <AvatarImage
            src={advise.author.image ?? undefined}
            alt={advise.author.name ?? undefined}
          />
          <AvatarFallback className="rounded-sm text-[10px]">
            {advise.author?.name?.charAt(0)}
          </AvatarFallback>
        </Avatar>

        <Link
          href={`/perfil/${advise.author.id}`}
          className="truncate font-mono text-sm font-semibold transition-colors hover:text-pcnGreen"
        >
          {advise.author.name}
        </Link>

        <span
          className="hidden shrink-0 font-mono text-[11px] text-muted-foreground sm:inline"
          suppressHydrationWarning
        >
          {formatDate(advise.createdAt)}
        </span>

        <div className="ml-auto flex shrink-0 items-center gap-1">
          <button
            type="button"
            className={cn(
              'flex items-center gap-1 rounded-sm px-1.5 py-0.5 font-mono text-[11px] transition-colors',
              isLiked
                ? 'text-red-500 hover:text-red-600'
                : 'text-muted-foreground hover:text-red-500',
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
      </div>

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

      <Link
        href={`/consejos/${advise.id}`}
        className="text-sm leading-relaxed text-foreground/90 transition-colors hover:text-foreground"
      >
        <span className="font-mono text-pcnGreen-500">&gt; </span>
        {advise.content}
      </Link>
    </div>
  );
};
