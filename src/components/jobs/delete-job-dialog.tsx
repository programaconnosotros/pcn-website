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
import { deleteJob } from '@/actions/jobs/delete-job';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface DeleteJobDialogProps {
  jobId: string;
  jobTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteJobDialog({ jobId, jobTitle, open, onOpenChange }: DeleteJobDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteJob(jobId);
      toast.success('Oferta eliminada exitosamente');
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar la oferta');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar esta oferta de trabajo?</AlertDialogTitle>
          <AlertDialogDescription>
            Estás a punto de eliminar la oferta &quot;{jobTitle}&quot;. Esta acción no se puede
            deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
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
