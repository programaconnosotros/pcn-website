'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
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
import { toast } from 'sonner';
import { deleteTalk } from '@/actions/talks/delete-talk';
import { Trash2, Loader2 } from 'lucide-react';
import { actionErrorMessage } from '@/lib/rate-limit-messages';

type Props = {
  talkId: string;
  talkTitle: string;
};

export function DeleteTalkButton({ talkId, talkTitle }: Props) {
  const [isPending, setIsPending] = useState(false);
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    setIsPending(true);
    try {
      await deleteTalk(talkId);
      toast.success('Charla eliminada');
      setOpen(false);
    } catch (error: any) {
      toast.error(actionErrorMessage(error, 'Error al eliminar la charla', true));
    } finally {
      setIsPending(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="ghost" disabled={isPending}>
          <Trash2 className="h-3 w-3" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar charla?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción eliminará permanentemente &quot;{talkTitle}&quot;. No se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            // Sin preventDefault el diálogo se cierra al click: no se ve el estado de carga y, si
            // falla, se pierde. Se cierra solo cuando termina bien.
            onClick={(event) => {
              event.preventDefault();
              void handleDelete();
            }}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? 'Eliminando...' : 'Eliminar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
