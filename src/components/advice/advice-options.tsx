'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Edit, MoreVertical, Trash } from 'lucide-react';
import { useState } from 'react';
import { DeleteAdviceDialog } from './delete-advice-dialog';
import { EditAdviceDialog } from './edit-advice-dialog';

// Edit / delete menu for a published consejo, shown to its author and to admins.
export function AdviceOptions({
  adviceId,
  content,
  tags = [],
}: {
  adviceId: string;
  content: string;
  tags?: string[];
}) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative z-10 h-6 w-6">
            <MoreVertical className="h-3.5 w-3.5" />
            <span className="sr-only">Opciones</span>
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

      <DeleteAdviceDialog
        adviceId={adviceId}
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      />
      <EditAdviceDialog
        adviceId={adviceId}
        initialContent={content}
        initialTags={tags}
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
    </>
  );
}
