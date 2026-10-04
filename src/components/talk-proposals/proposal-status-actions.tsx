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
import { TalkProposalStatus } from '@/generated/prisma/browser';
import { updateTalkProposalStatus } from '@/actions/talk-proposals/update-talk-proposal-status';
import { deleteTalkProposal } from '@/actions/talk-proposals/delete-talk-proposal';
import { createTalkFromProposal } from '@/actions/talks/create-talk-from-proposal';
import { CheckCircle, XCircle, Trash2, Mic, Loader2 } from 'lucide-react';
import { actionErrorMessage } from '@/lib/rate-limit-messages';

type Props = {
  proposalId: string;
  currentStatus: TalkProposalStatus;
  speakerName: string;
  hasTalk?: boolean;
};

export function ProposalStatusActions({ proposalId, currentStatus, speakerName, hasTalk }: Props) {
  const [isPending, setIsPending] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleStatusChange = async (status: TalkProposalStatus) => {
    setIsPending(true);
    try {
      await updateTalkProposalStatus(proposalId, status);
      toast.success(status === 'ACCEPTED' ? 'Propuesta aceptada' : 'Propuesta rechazada');
    } catch (error: any) {
      toast.error(
        actionErrorMessage(
          error,
          'No se pudo actualizar la propuesta. Revisá que gestiones este evento.',
          true,
        ),
      );
    } finally {
      setIsPending(false);
    }
  };

  const handlePromoteToTalk = async () => {
    setIsPending(true);
    try {
      const result = await createTalkFromProposal(proposalId);
      if (result.alreadyExists) {
        toast.info('Esta propuesta ya tiene una charla creada');
      } else {
        toast.success('Charla creada a partir de la propuesta');
      }
    } catch (error: any) {
      toast.error(
        actionErrorMessage(
          error,
          'No se pudo crear la charla. Revisá que gestiones este evento.',
          true,
        ),
      );
    } finally {
      setIsPending(false);
    }
  };

  const handleDelete = async () => {
    setIsPending(true);
    try {
      await deleteTalkProposal(proposalId);
      toast.success('Propuesta eliminada');
      setDeleteOpen(false);
    } catch (error: any) {
      toast.error(
        actionErrorMessage(
          error,
          'No se pudo eliminar la propuesta. Revisá que gestiones este evento.',
          true,
        ),
      );
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        size="sm"
        variant="default"
        className="gap-1 bg-green-600 hover:bg-green-700"
        loading={isPending}
        disabled={isPending || currentStatus === 'ACCEPTED'}
        onClick={() => handleStatusChange('ACCEPTED')}
      >
        <CheckCircle className="h-3 w-3" />
        aceptar();
      </Button>

      <Button
        size="sm"
        variant="destructive"
        className="gap-1"
        loading={isPending}
        disabled={isPending || currentStatus === 'REJECTED'}
        onClick={() => handleStatusChange('REJECTED')}
      >
        <XCircle className="h-3 w-3" />
        rechazar();
      </Button>

      {currentStatus === 'ACCEPTED' && (
        <Button
          size="sm"
          variant="outline"
          className="gap-1"
          loading={isPending}
          loadingText={hasTalk ? '// charla creada' : 'creando...'}
          disabled={isPending || !!hasTalk}
          onClick={handlePromoteToTalk}
          title={hasTalk ? 'Ya tiene una charla creada' : 'Crear charla a partir de esta propuesta'}
        >
          <Mic className="h-3 w-3" />
          {hasTalk ? '// charla creada' : 'crearCharla();'}
        </Button>
      )}

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogTrigger asChild>
          <Button size="sm" variant="ghost" disabled={isPending}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar propuesta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente la propuesta de {speakerName}. No se puede
              deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>cancelar();</AlertDialogCancel>
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
              {isPending ? 'eliminando...' : 'eliminar();'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
