'use client';

import { Setup } from '@/actions/setup/get-setup';
import { toggleLikeSetup } from '@/actions/setup/like-setup';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Session, User } from '@prisma/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Edit, Heart, MoreVertical, Trash } from 'lucide-react';
import { useOptimistic, useState } from 'react';

interface SetupCardProps {
  setup: Setup;
  session: (Session & { user: User }) | null;
  onDelete: () => void;
  onEdit: () => void;
  onRequireAuth?: () => void;
}

export function SetupCard({ setup, session, onDelete, onEdit, onRequireAuth }: SetupCardProps) {
  const [imgError, setImgError] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [optimisticLikes,] = useOptimistic(
    setup.likes,
    (state, userId: string) => {
      const isLiked = state.some((like) => like.userId === userId);
      return isLiked ? state.filter((like) => like.userId !== userId) : [...state, { userId }];
    },
  );
  const queryClient = useQueryClient();

  const isAuthor =
    (session?.user?.id && session.user.id === setup.author.id) ||
    (session?.user?.email && session.user.email === setup.author.email);

  const isLiked = session?.user?.id
    ? optimisticLikes.some((like) => like.userId === session.user.id)
    : false;

  const mutation = useMutation({
    mutationFn: () => toggleLikeSetup(setup.id),
    onMutate: async () => {
      if (!session?.user?.id) {
        onRequireAuth?.();
        throw new Error('No user');
      }
      setIsLiking(true);
      
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['setups'] });
      
      // Snapshot the previous value
      const previousSetups = queryClient.getQueryData(['setups']);
      
      // Optimistically update to the new value
      queryClient.setQueryData(['setups'], (old: any[] = []) => {
        return old.map((s: any) =>
          s.id === setup.id
            ? {
                ...s,
                likes: isLiked
                  ? s.likes.filter((like: any) => like.userId !== session.user.id)
                  : [...s.likes, { userId: session.user.id }]
              }
            : s
        );
      });

      return { previousSetups };
    },
    onError: (err, variables, context: any) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousSetups) {
        queryClient.setQueryData(['setups'], context.previousSetups);
      }
    },
    onSettled: () => {
      setIsLiking(false);
      // Invalidate and refetch to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ['setups'] });
    },
  });

  const handleEdit = () => {
    onEdit();
  };

  const handleDelete = () => {
    onDelete();
  };

  const handleLike = () => {
    mutation.mutate();
  };

  const Options = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleEdit}>
          <Edit className="mr-2 h-4 w-4" />
          <span>Editar</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleDelete}>
          <Trash className="mr-2 h-4 w-4" />
          <span>Eliminar</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="bg-white dark:bg-black">
      <Card className="bg-white dark:bg-black border-2 border-gray-200 dark:border-gray-700  hover:dark:border-gray-300 transition-all duration-300  group">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="w-10 h-10  rounded-lg transition-transform duration-200 group-hover:scale-105">
                <AvatarImage src={setup.author.image ?? undefined} alt={setup.author.name} />
                <AvatarFallback className="rounded-lg ">{setup.author.name.charAt(0)}</AvatarFallback>
              </Avatar>

              <div>
                <h3 className="font-semibold text-gray-700  transition-colors duration-200 group-hover:text-black group-hover:dark:text-white dark:text-white group-hover:scale-105">
                  {setup.author.name}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isAuthor && Options}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pb-3">
          <h2 className="text-xl font-bold text-gray-600 dark:text-gray-300 mb-2 transition-colors duration-200 group-hover:text-black group-hover:dark:text-white dark:text-white">
            {setup.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4 transition-colors duration-200 group-hover:dark:text-gray-200 ">
            {setup.content}
          </p>

          <div className="relative overflow-hidden aspect-square">
            <img
              src={imgError || !setup.imageUrl 
                ? "/white.png" 
                : `${setup.imageUrl}?t=${setup?.updatedAt}`}
              alt={setup.title}
              className="object-cover object-center w-full h-full transition-transform duration-300 group-hover:scale-105"
              onError={() => setImgError(true)}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
          </div>
        </CardContent>

        <CardFooter className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                disabled={isLiking || mutation.status === 'pending'}
                className={`flex items-center space-x-2 transition-all duration-200 hover:scale-105 ${
                  isLiked ? "text-red-500" : "text-gray-700 dark:text-gray-300"
                } hover:text-red-500`}
              >
                <Heart
                  className={`w-4 h-4 transition-all duration-200 ${isLiked ? "fill-current scale-110" : ""}`}
                  fill={isLiked ? 'currentColor' : 'none'}
                />
                <span className="transition-all duration-200">{optimisticLikes.length} me gusta</span>
              </Button>
            </div>

            <span className="text-sm text-gray-700 transition-colors duration-200 dark:text-gray-300 font-medium">
              {setup.createdAt.toLocaleDateString()}
            </span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
} 