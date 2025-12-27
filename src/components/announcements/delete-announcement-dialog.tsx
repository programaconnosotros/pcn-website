'use client';

import { useState } from 'react';
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
import { deleteAnnouncement } from '@/actions/announcements/delete-announcement';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface DeleteAnnouncementDialogProps {
  announcementId: string;
  announcementTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteAnnouncementDialog({
  announcementId,
  announcementTitle,
  open,
  onOpenChange,
}: DeleteAnnouncementDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteAnnouncement(announcementId);
      toast.success('Anuncio eliminado exitosamente');
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar el anuncio');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar anuncio?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. El anuncio &quot;{announcementTitle}&quot; será
            eliminado permanentemente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Eliminando...
              </>
            ) : (
              'Eliminar'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
