'use client';

import { toggleLikeSetup } from '@/actions/setup/like-setup';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Session, Setup, User } from '@prisma/client';
import { Edit, Heart, MoreVertical, Trash } from 'lucide-react';
import { useOptimistic, useState, useTransition } from 'react';

interface SetupCardProps {
  setup: Setup & {
    author: Pick<User, 'id' | 'name' | 'email' | 'image'>;
    likes: { userId: string }[];
  };
  session: (Session & { user: User }) | null;
  onDelete: () => void;
  onEdit: () => void;
  onRequireAuth?: () => void;
}

export function SetupCard({ setup, session, onDelete, onEdit, onRequireAuth }: SetupCardProps) {
  const [imgError, setImgError] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [localLikes, setLocalLikes] = useState(setup.likes);

  const [optimisticLikes, addOptimisticLike] = useOptimistic(
    localLikes,
    (state, userId: string) => {
      const isLiked = state.some((like) => like.userId === userId);
      return isLiked ? state.filter((like) => like.userId !== userId) : [...state, { userId }];
    }
  );

  const isAuthor =
    (session?.user?.id && session.user.id === setup.author.id) ||
    (session?.user?.email && session.user.email === setup.author.email);

  const isLiked = session?.user?.id
    ? optimisticLikes.some((like) => like.userId === session.user.id)
    : false;

  const handleLike = () => {
    if (!session?.user?.id) {
      onRequireAuth?.();
      return;
    }

    // Actualizar el estado local primero
    const newLikes = isLiked
      ? localLikes.filter((like) => like.userId !== session.user.id)
      : [...localLikes, { userId: session.user.id }];
    setLocalLikes(newLikes);

    // Luego actualizar optimistamente
    addOptimisticLike(session.user.id);

    startTransition(async () => {
      try {
        await toggleLikeSetup(setup.id);
      } catch (error) {
        console.error('Error toggling like:', error);
        // Revertir el estado local si hay error
        setLocalLikes(setup.likes);
      }
    });
  };

  const Options = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onEdit}>
          <Edit className="mr-2 h-4 w-4" />
          <span>Editar</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={onDelete}>
          <Trash className="mr-2 h-4 w-4" />
          <span>Eliminar</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="bg-white dark:bg-black">
      <Card className="group border-2 border-gray-200 bg-white transition-all duration-300 dark:border-gray-700 dark:bg-black hover:dark:border-gray-300">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10 rounded-lg transition-transform duration-200 group-hover:scale-105">
                <AvatarImage src={setup.author.image ?? undefined} alt={setup.author.name} />
                <AvatarFallback className="rounded-lg">
                  {setup.author.name.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <div>
                <h3 className="font-semibold text-gray-700 transition-colors duration-200 group-hover:scale-105 group-hover:text-black dark:text-white group-hover:dark:text-white">
                  {setup.author.name}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">{isAuthor && Options}</div>
          </div>
        </CardHeader>

        <CardContent className="pb-3">
          <h2 className="mb-2 text-xl font-bold text-gray-600 transition-colors duration-200 group-hover:text-black dark:text-gray-300 dark:text-white group-hover:dark:text-white">
            {setup.title}
          </h2>
          <p className="mb-4 text-gray-600 transition-colors duration-200 dark:text-gray-300 group-hover:dark:text-gray-200">
            {setup.content}
          </p>

          <div className="relative aspect-square overflow-hidden">
            <img
              src={
                imgError || !setup.imageUrl
                  ? '/white.png'
                  : `${setup.imageUrl}?t=${setup?.updatedAt}`
              }
              alt={setup.title}
              className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
              onError={() => setImgError(true)}
            />
            <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/5" />
          </div>
        </CardContent>

        <CardFooter className="border-t border-gray-200 pt-3 dark:border-gray-700">
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                disabled={isPending}
                className={`flex items-center space-x-2 transition-all duration-200 hover:scale-105 ${
                  isLiked ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'
                } hover:text-red-500`}
              >
                <Heart
                  className={`h-4 w-4 transition-all duration-200 ${isLiked ? 'scale-110 fill-current' : ''}`}
                  fill={isLiked ? 'currentColor' : 'none'}
                />
                <span className="transition-all duration-200">
                  {optimisticLikes.length} me gusta
                </span>
              </Button>
            </div>

            <span className="text-sm font-medium text-gray-700 transition-colors duration-200 dark:text-gray-300">
              {setup.createdAt.toLocaleDateString()}
            </span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
