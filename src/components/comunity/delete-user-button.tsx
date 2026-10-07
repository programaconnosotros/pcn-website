'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { deleteUser } from '@/actions/users/delete-user';
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
import { actionErrorMessage } from '@/lib/rate-limit-messages';

// For admins in the users table: delete an account for good, after confirming. There's no undo,
// so the dialog says what goes with it and points to suspending instead.
export function DeleteUserButton({ userId, userName }: { userId: string; userName: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const remove = () =>
    startTransition(async () => {
      try {
        const result = await deleteUser(userId);
        if (!result.success) {
          toast.error(result.error);
          return;
        }
        setOpen(false);
        toast.success(`Eliminaste la cuenta de ${userName}`);
        router.refresh();
      } catch (error) {
        toast.error(actionErrorMessage(error, 'No se pudo eliminar la cuenta', true));
      }
    });

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title={`Eliminar la cuenta de ${userName}`}
        className="inline-flex items-center gap-1 border border-transparent px-1.5 py-0.5 font-mono text-[10px] lowercase text-muted-foreground transition-colors hover:border-red-500/60 hover:text-red-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-500"
      >
        <Trash2 className="size-3" aria-hidden />
        eliminar
      </button>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar la cuenta de {userName}?</AlertDialogTitle>
          <AlertDialogDescription>
            Se borran para siempre su perfil, sus consejos, comentarios, likes, proyectos e
            inscripciones. No se puede deshacer. Si solo querés que no pueda entrar, suspendé la
            cuenta.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              // Keep the dialog open until the action answers.
              event.preventDefault();
              remove();
            }}
            disabled={isPending}
            className="bg-red-600 text-white hover:bg-red-600/90"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? 'Eliminando...' : 'Eliminar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
