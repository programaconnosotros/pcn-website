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
import { deleteGalleryPhoto } from '@/actions/gallery/delete-gallery-photo';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface DeletePhotoDialogProps {
  photoId: string;
  photoTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeletePhotoDialog({
  photoId,
  photoTitle,
  open,
  onOpenChange,
}: DeletePhotoDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteGalleryPhoto(photoId);
      toast.success('Foto eliminada exitosamente');
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar la foto');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar foto?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. La foto &quot;{photoTitle}&quot; será eliminada
            permanentemente.
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
