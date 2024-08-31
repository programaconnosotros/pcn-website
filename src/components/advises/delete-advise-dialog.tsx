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

interface DeleteAdviseDialogProps {
  adviseId: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export const DeleteAdviseDialog = ({ adviseId, isOpen, onOpenChange }: DeleteAdviseDialogProps) => {
  const handleDelete = () => {
    toast.promise(deleteAdvise(adviseId), {
      loading: 'Eliminando consejo...',
      success: () => {
        onOpenChange(false);
        return 'Consejo eliminado correctamente';
      },
      error: 'Error al eliminar el consejo',
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
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>Confirmar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
