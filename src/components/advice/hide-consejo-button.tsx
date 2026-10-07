'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  hideExtractedConsejo,
  restoreExtractedConsejo,
} from '@/actions/advice/hide-extracted-consejo';
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

// For the member an extracted consejo is attributed to (and admins): take it off the site. The
// toast offers to undo it right away.
export function HideConsejoButton({ consejoId }: { consejoId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const restore = async () => {
    try {
      await restoreExtractedConsejo(consejoId);
      toast.success('Consejo restaurado');
      router.push(`/consejos/${consejoId}`);
    } catch (error) {
      toast.error(actionErrorMessage(error, 'No se pudo restaurar el consejo'));
    }
  };

  const hide = () =>
    startTransition(async () => {
      try {
        await hideExtractedConsejo(consejoId);
        setOpen(false);
        toast.success('Ocultaste el consejo', { action: { label: 'Deshacer', onClick: restore } });
        router.push('/consejos');
      } catch (error) {
        toast.error(actionErrorMessage(error, 'No se pudo ocultar el consejo'));
      }
    });

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 text-muted-foreground transition-colors hover:text-pcnGreen"
      >
        <EyeOff className="size-3" aria-hidden />
        no es mío, ocultar
      </button>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Ocultar este consejo?</AlertDialogTitle>
          <AlertDialogDescription>
            Se extrajo automáticamente de una conversación y se te atribuye a vos. Si no lo dijiste
            así o preferís que no figure, deja de aparecer en /consejos, en tu perfil y en la
            búsqueda.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={hide} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? 'Ocultando...' : 'Ocultar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
