'use client';

import { toggleLike } from '@/actions/advises/like-advise';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDate } from '@/lib/utils';
import { Advise, Session, User, Like } from '@prisma/client';
import { Edit, Heart, MoreVertical, Trash } from 'lucide-react';
import Link from 'next/link';
import { useOptimistic, useState } from 'react';
import { DeleteAdviseDialog } from './delete-advise-dialog';
import { EditAdviseDialog } from './edit-advise-dialog';

export const AdviseCard = ({
  advise,
  session,
}: {
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
    const previousLikes = [...optimisticLikes];

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

  const Author = (
    <div className="flex items-center gap-3">
      <Avatar className="h-10 w-10">
        <AvatarImage src={advise.author.image ?? undefined} alt={advise.author.name ?? undefined} />
        <AvatarFallback>{advise.author?.name?.charAt(0)}</AvatarFallback>
      </Avatar>

      <div className="flex flex-col">
        <Link href={`/perfil/${advise.author.id}`} className="hover:underline">
          <h3 className="text-base font-semibold leading-tight">{advise.author.name}</h3>
        </Link>
      </div>
    </div>
  );

  const Options = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
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
    <Card 
      key={advise.id} 
      className="w-full border-2 border-transparent bg-gradient-to-br from-white to-gray-50 transition-all duration-300 hover:scale-[1.02] hover:border-pcnPurple hover:shadow-xl dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-800 dark:hover:border-pcnGreen dark:hover:shadow-pcnGreen/20"
    >
      <CardHeader className="flex flex-row items-center justify-between gap-3 px-4 py-3">
        {Author}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className={isLiked ? 'text-red-500 hover:text-red-600' : 'hover:text-red-500'}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleLike();
            }}
          >
            <Heart className="h-4 w-4" fill={isLiked ? 'currentColor' : 'none'} />
            <span className="sr-only">Me gusta</span>
          </Button>
          {canEditOrDelete && Options}
        </div>
      </CardHeader>

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

      <Link href={`/consejos/${advise.id}`} className="block">
        <CardContent className="px-4 pb-6 pt-2">
          <p>{advise.content}</p>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-gray-500">{formatDate(advise.createdAt)}</p>
            <p className="text-xs text-gray-500">
              {optimisticLikes.length} {optimisticLikes.length === 1 ? 'like' : 'likes'}
            </p>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
};
