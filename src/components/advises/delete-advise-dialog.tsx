import { useTransition } from 'react';
import { toast } from 'sonner';
import { deleteAdvise } from '@actions/advises/delete-advise';
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
import { Loader2 } from 'lucide-react';

interface DeleteAdviseDialogProps {
  adviseId: string;
  isOpen: boolean;
  onOpenChange: (_isOpen: boolean) => void;
}

export const DeleteAdviseDialog = ({ adviseId, isOpen, onOpenChange }: DeleteAdviseDialogProps) => {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      await toast.promise(deleteAdvise(adviseId), {
        loading: 'Eliminando consejo...',
        success: () => {
          onOpenChange(false);
          return 'Consejo eliminado correctamente';
        },
        error: 'Error al eliminar el consejo',
      });
    });
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás seguro de eliminar este consejo?</AlertDialogTitle>

          <AlertDialogDescription>
            Esta acción no se puede deshacer. El consejo será eliminado permanentemente.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? 'Eliminando...' : 'Confirmar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
