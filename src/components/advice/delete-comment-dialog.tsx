import { useTransition } from 'react';
import { toast } from 'sonner';
import { deleteComment } from '@/actions/comments/delete-comment';
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

interface DeleteCommentDialogProps {
  /** The comment to delete; null keeps the dialog closed. */
  commentId: string | null;
  /** Whether it opens a thread, so the dialog warns that its replies go with it. */
  hasReplies: boolean;
  onClose: () => void;
}

export const DeleteCommentDialog = ({
  commentId,
  hasReplies,
  onClose,
}: DeleteCommentDialogProps) => {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!commentId) return;
    startTransition(async () => {
      const promise = deleteComment(commentId);
      toast.promise(promise, {
        loading: 'Eliminando comentario...',
        success: () => {
          onClose();
          return 'Comentario eliminado';
        },
        error: (error) => actionErrorMessage(error, 'Error al eliminar el comentario'),
      });
      await promise.catch(() => {});
    });
  };

  return (
    <AlertDialog open={!!commentId} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar este comentario?</AlertDialogTitle>

          <AlertDialogDescription>
            Esta acción no se puede deshacer.
            {hasReplies && ' Las respuestas al comentario también se eliminan.'}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              // Que el diálogo quede abierto mientras se borra
              event.preventDefault();
              handleDelete();
            }}
            disabled={isPending}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? 'Eliminando...' : 'Eliminar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
