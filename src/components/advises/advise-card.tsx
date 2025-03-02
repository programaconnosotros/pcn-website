'use client';

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
import { Advise, User } from '@prisma/generated/zod';
import { Edit, MoreVertical, Trash } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { DeleteAdviseDialog } from './delete-advise-dialog';
import { EditAdviseDialog } from './edit-advise-dialog';

export const AdviseCard = ({ advise }: { advise: Advise & { author: User } }) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // TODO: Get session from database or cookie.
  const session = {
    user: {
      id: '123',
      email: 'john.doe@example.com',
    },
  };

  const isAuthor =
    (session?.user?.id && session.user.id === advise.author.id) ||
    (session?.user?.email && session.user.email === advise.author.email);

  const Author = (
    <div className="flex items-center gap-3">
      <Avatar className="h-10 w-10">
        <AvatarImage src={advise.author.image ?? undefined} alt={advise.author.name ?? undefined} />
        <AvatarFallback>{advise.author?.name?.charAt(0)}</AvatarFallback>
      </Avatar>

      <div className="flex flex-col">
        <Link href={`/profile/${advise.author.id}`} className="hover:underline">
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
    <Card key={advise.id} className="w-full">
      <CardHeader className="flex flex-row items-center justify-between gap-3 px-4 py-3">
        {Author}
        {isAuthor && Options}
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

      <CardContent className="px-4 py-6">
        <p className="text-sm">{advise.content}</p>
        <p className="mt-4 text-xs text-gray-500">{formatDate(advise.createdAt)}</p>
      </CardContent>
    </Card>
  );
};
