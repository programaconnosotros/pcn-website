'use client';

import type { SetupFormData } from '@/schemas/setup-schema';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { deleteSetup } from '@/actions/setups/setup-actions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { actionErrorMessage } from '@/lib/rate-limit-messages';
import { SetupFormDialog } from './setup-form-dialog';

interface SetupOwnerActionsProps {
  setup: SetupFormData & { id: string; imageUrl: string };
  /** Only the author edits; admins can also delete, to moderate. */
  canEdit: boolean;
}

export function SetupOwnerActions({ setup, canEdit }: SetupOwnerActionsProps) {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, startDelete] = useTransition();

  const handleDelete = () =>
    startDelete(async () => {
      try {
        await deleteSetup(setup.id);
        toast.success('Setup eliminado');
        setIsDeleteOpen(false);
        router.push('/setups');
      } catch (error) {
        toast.error(actionErrorMessage(error, 'No se pudo eliminar el setup'));
      }
    });

  return (
    <div className="flex gap-2">
      {canEdit && (
        <>
          <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)}>
            <Pencil className="mr-1.5 size-3.5" />
            editar
          </Button>
          <SetupFormDialog setup={setup} open={isEditOpen} onOpenChange={setIsEditOpen} />
        </>
      )}
      <Button
        variant="outline"
        size="sm"
        className="hover:border-destructive hover:text-destructive"
        onClick={() => setIsDeleteOpen(true)}
      >
        <Trash2 className="mr-1.5 size-3.5" />
        eliminar
      </Button>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este setup?</AlertDialogTitle>
            <AlertDialogDescription>
              Se borran la foto, la descripción y los me gusta. No se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
