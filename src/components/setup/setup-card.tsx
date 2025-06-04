'use client';

import { Setup } from '@/actions/setup/get-setup';
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
import { Edit, Heart, MoreVertical, Share2, Trash } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

interface SetupCardProps {
  setup: Setup;
  session: (Session & { user: User }) | null;
  onDelete: () => void;
}

export function SetupCard({ setup, session, onDelete }: SetupCardProps) {
  const [imgError, setImgError] = useState(false);
  const [modalAction, setModalAction] = useState<'edit' | 'delete' | null>(null);
  const isAuthor =
    (session?.user?.id && session.user.id === setup.author.id) ||
    (session?.user?.email && session.user.email === setup.author.email);

  const handleEdit = () => {
    if (!session) {
      setModalAction('edit');
      return;
    }
    // Aquí iría la lógica para editar
  };

  const handleDelete = () => {
    onDelete();
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

  const getModalContent = () => {
    if (modalAction === 'edit') {
      return {
        title: "Estás editando un setup",
        description: "Únete a programaConNosotros para poder editar tu setup.",
        icon: <Edit className="w-8 h-8 text-blue-500" />
      };
    }
    return {
      title: "Estás eliminando un setup",
      description: "Únete a programaConNosotros para poder eliminar tu setup.",
      icon: <Trash className="w-8 h-8 text-red-500" />
    };
  };


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
                <p className="text-sm text-gray-500 transition-colors duration-200 group-hover:text-gray-600">
                  @{setup.author.email}
                </p>
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
                onClick={()=> console.log(setup.id)}
                className={`flex items-center space-x-2 transition-all duration-200 hover:scale-105 ${
                  setup.likes.some((like) => like.userId === session?.user.id) ? "text-red-500" : "text-gray-500"
                } hover:text-red-500`}
              >
                <Heart
                  className={`w-4 h-4 transition-all duration-200 ${setup.likes.some((like) => like.userId ===  session?.user.id) ? "fill-current scale-110" : ""}`}
                />
                <span className="transition-all duration-200">{setup.likes.length} me gusta</span>
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