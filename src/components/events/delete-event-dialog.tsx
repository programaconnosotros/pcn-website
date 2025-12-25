'use client';

import { toast } from 'sonner';
import { deleteEvent } from '@/actions/events/delete-event';
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

interface DeleteEventDialogProps {
  eventId: string;
  eventName: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export const DeleteEventDialog = ({
  eventId,
  eventName,
  isOpen,
  onOpenChange,
}: DeleteEventDialogProps) => {
  const handleDelete = () => {
    toast.promise(deleteEvent(eventId), {
      loading: 'Eliminando evento...',
      success: () => {
        onOpenChange(false);
        return 'Evento eliminado correctamente';
      },
      error: (error) => {
        console.error('Error al eliminar el evento', error);
        return error.message || 'Error al eliminar el evento';
      },
    });
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás seguro de eliminar este evento?</AlertDialogTitle>
          <AlertDialogDescription>
            Estás a punto de eliminar el evento &quot;{eventName}&quot;. Esta acción no se puede
            deshacer. El evento será eliminado y ya no aparecerá en la lista de eventos.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};


