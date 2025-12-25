'use client';

import { Button } from '@/components/ui/button';
import { deleteRegistration } from '@/actions/events/delete-registration';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

type DeleteRegistrationButtonProps = {
  registrationId: string;
  userName: string;
};

export function DeleteRegistrationButton({
  registrationId,
  userName,
}: DeleteRegistrationButtonProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await toast.promise(deleteRegistration(registrationId), {
        loading: 'Eliminando inscripción...',
        success: 'Inscripción eliminada exitosamente',
        error: (error) => {
          console.error('Error al eliminar inscripción', error);
          return error.message || 'Ocurrió un error al eliminar la inscripción';
        },
      });
      setOpen(false);
      router.refresh();
    } catch (error) {
      // El error ya se maneja en toast.promise
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar inscripción?</AlertDialogTitle>
          <AlertDialogDescription>
            Estás a punto de eliminar la inscripción de <strong>{userName}</strong>. Esta acción
            liberará el cupo correspondiente y no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
