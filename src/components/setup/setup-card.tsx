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
import { QueryKey, useMutation, useQueryClient } from '@tanstack/react-query';
import { Edit, Heart, MoreVertical, Share2, Trash } from 'lucide-react';
import Image from 'next/image';
import { useOptimistic, useState } from 'react';

interface SetupCardProps {
  setup: Setup;
  session: (Session & { user: User }) | null;
  onDelete: () => void;
  onRequireAuth?: () => void;
}

export function SetupCard({ setup, session, onDelete, onRequireAuth }: SetupCardProps) {
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
      await queryClient.cancelQueries({ queryKey: ['setups']});
      const previousSetups = queryClient.getQueryData(['setups'] as QueryKey) as any[];      
      queryClient.setQueryData(['setups'] as const, (old: any[] = []) => {
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
      if (context?.previousSetups) {
        queryClient.setQueryData(['setups'] as const, context.previousSetups);
      }
    },
    onSettled: () => {
      setIsLiking(false);
      // Refetch global solo en eventos importantes, no aquí
    },
  });

  const handleEdit = () => {
    // Aquí iría la lógica para editar
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

  console.log(isAuthor);
  return (
    <>
      <Card className="bg-white border border-gray-200 hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300 hover:-translate-y-1 group">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="w-10 h-10 transition-transform duration-200 group-hover:scale-105">
                <AvatarImage src={setup.author.image ?? undefined} alt={setup.author.name} />
                <AvatarFallback className="rounded-lg">{setup.author.name.charAt(0)}</AvatarFallback>
              </Avatar>

              <div>
                <h3 className="font-semibold text-gray-900 transition-colors duration-200 group-hover:text-black">
                  {setup.author.name}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isAuthor && Options}
              <Button
                variant="ghost"
                size="sm"
                onClick={()=>
                  console.log(setup.id)
                }
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pb-3">
          <h2 className="text-xl font-bold text-gray-900 mb-2 transition-colors duration-200 group-hover:text-black">
            {setup.title}
          </h2>
          <p className="text-gray-600 mb-4 transition-colors duration-200 group-hover:text-gray-700">
            {setup.content}
          </p>

          <div className="relative rounded-lg overflow-hidden aspect-[16/7]">
            <Image
              src={imgError || !setup.imageUrl ? "/white.png" : setup.imageUrl}
              alt={setup.title}
              blurDataURL='/elementor-placeholder-image.webp'
              placeholder='blur'
              fill
              className="object-cover object-center w-full h-full transition-transform duration-300 group-hover:scale-105"
              onError={() => setImgError(true)}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
          </div>
        </CardContent>

        <CardFooter className="pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                disabled={isLiking || mutation.status === 'pending'}
                className={`flex items-center space-x-2 transition-all duration-200 hover:scale-105 ${
                  isLiked ? "text-red-500" : "text-gray-500"
                } hover:text-red-500`}
              >
                <Heart
                  className={`w-4 h-4 transition-all duration-200 ${isLiked ? "fill-current scale-110" : ""}`}
                  fill={isLiked ? 'currentColor' : 'none'}
                />
                <span className="transition-all duration-200">{optimisticLikes.length} me gusta</span>
              </Button>
            </div>

            <span className="text-sm text-gray-500 transition-colors duration-200 group-hover:text-gray-600 font-medium">
              {setup.createdAt.toLocaleDateString()}
            </span>
          </div>
        </CardFooter>
      </Card>
    </>
  );
} 