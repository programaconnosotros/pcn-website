import { useTransition } from 'react';
import { toast } from 'sonner';
import { deleteAdvice } from '@actions/advice/delete-advice';
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
import { actionErrorMessage } from '@/lib/rate-limit-messages';

interface DeleteAdviceDialogProps {
  adviceId: string;
  isOpen: boolean;
  onOpenChange: (_isOpen: boolean) => void;
}

export const DeleteAdviceDialog = ({ adviceId, isOpen, onOpenChange }: DeleteAdviceDialogProps) => {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      // toast.promise devuelve el id del toast: se espera la action para que la transición dure lo
      // que tarda en borrarse
      const promise = deleteAdvice(adviceId);
      toast.promise(promise, {
        loading: 'Eliminando consejo...',
        success: () => {
          onOpenChange(false);
          return 'Consejo eliminado correctamente';
        },
        error: (error) => actionErrorMessage(error, 'Error al eliminar el consejo'),
      });
      await promise.catch(() => {});
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
