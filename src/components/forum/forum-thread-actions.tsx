'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, LockOpen, Pencil, Pin, PinOff, Trash } from 'lucide-react';
import { toast } from 'sonner';
import { deleteForumPost, moderateForumPost } from '@/actions/forum/posts';
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

const actionClassName =
  'flex items-center gap-1 text-muted-foreground transition-colors hover:text-pcnGreen disabled:opacity-50';

// Edit and delete for the thread's author (and admins); pin and lock for admins.
export function ForumThreadActions({
  postId,
  canEdit,
  isAdmin,
  isPinned,
  isLocked,
}: {
  postId: string;
  canEdit: boolean;
  isAdmin: boolean;
  isPinned: boolean;
  isLocked: boolean;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  const run = (action: () => Promise<unknown>, success: string, after?: () => void) =>
    startTransition(async () => {
      try {
        await action();
        toast.success(success);
        after?.();
      } catch (error) {
        toast.error(actionErrorMessage(error, 'No se pudo completar la acción'));
      }
    });

  return (
    <div className="flex flex-wrap items-center gap-3 font-mono text-[11px]">
      {canEdit && (
        <>
          <Link href={`/foro/tema/${postId}/editar`} className={actionClassName}>
            <Pencil className="size-3" aria-hidden />
            editar
          </Link>
          <button type="button" className={actionClassName} onClick={() => setConfirming(true)}>
            <Trash className="size-3" aria-hidden />
            eliminar
          </button>
        </>
      )}
      {isAdmin && (
        <>
          <button
            type="button"
            disabled={isPending}
            className={actionClassName}
            onClick={() =>
              run(
                () => moderateForumPost(postId, { isPinned: !isPinned }),
                isPinned ? 'Tema desfijado' : 'Tema fijado',
              )
            }
          >
            {isPinned ? <PinOff className="size-3" /> : <Pin className="size-3" />}
            {isPinned ? 'desfijar' : 'fijar'}
          </button>
          <button
            type="button"
            disabled={isPending}
            className={actionClassName}
            onClick={() =>
              run(
                () => moderateForumPost(postId, { isLocked: !isLocked }),
                isLocked ? 'Tema reabierto' : 'Tema cerrado',
              )
            }
          >
            {isLocked ? <LockOpen className="size-3" /> : <Lock className="size-3" />}
            {isLocked ? 'reabrir' : 'cerrar'}
          </button>
        </>
      )}

      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este tema?</AlertDialogTitle>
            <AlertDialogDescription>
              Se borran también todas sus respuestas. No se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={isPending}
              onClick={() =>
                run(
                  () => deleteForumPost(postId),
                  'Tema eliminado',
                  () => router.push('/foro'),
                )
              }
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
