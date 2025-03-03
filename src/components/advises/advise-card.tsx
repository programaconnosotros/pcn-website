'use client';

import { useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { MoreVertical, Edit, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DeleteAdviseDialog } from './delete-advise-dialog';
import { EditAdviseDialog } from './edit-advise-dialog';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { User, Advise, Session } from '@prisma/client';

export const AdviseCard = async ({
  advise,
  session,
}: {
  advise: Advise & { author: User };
  session: (Session & { user: User }) | null;
}) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

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
        <h3 className="text-base font-semibold leading-tight">{advise.author.name}</h3>
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
        <p className="mt-4 text-xs text-gray-500">
          {format(new Date(advise.createdAt), "d 'de' MMMM 'de' yyyy 'a las' HH:mm", {
            locale: es,
          })}
        </p>
      </CardContent>
    </Card>
  );
};
