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
import { TalkProposalStatus } from '@prisma/client';
import { updateTalkProposalStatus } from '@/actions/talk-proposals/update-talk-proposal-status';
import { deleteTalkProposal } from '@/actions/talk-proposals/delete-talk-proposal';
import { createTalkFromProposal } from '@/actions/talks/create-talk-from-proposal';
import { CheckCircle, XCircle, Trash2, Mic } from 'lucide-react';

type Props = {
  proposalId: string;
  currentStatus: TalkProposalStatus;
  speakerName: string;
  hasTalk?: boolean;
};

export function ProposalStatusActions({ proposalId, currentStatus, speakerName, hasTalk }: Props) {
  const [isPending, setIsPending] = useState(false);

  const handleStatusChange = async (status: TalkProposalStatus) => {
    setIsPending(true);
    try {
      await updateTalkProposalStatus(proposalId, status);
      toast.success(status === 'ACCEPTED' ? 'Propuesta aceptada' : 'Propuesta rechazada');
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar el estado');
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
      toast.error(error.message || 'Error al crear la charla');
    } finally {
      setIsPending(false);
    }
  };

  const handleDelete = async () => {
    setIsPending(true);
    try {
      await deleteTalkProposal(proposalId);
      toast.success('Propuesta eliminada');
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar la propuesta');
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
        disabled={isPending || currentStatus === 'ACCEPTED'}
        onClick={() => handleStatusChange('ACCEPTED')}
      >
        <CheckCircle className="h-3 w-3" />
        Aceptar
      </Button>

      <Button
        size="sm"
        variant="destructive"
        className="gap-1"
        disabled={isPending || currentStatus === 'REJECTED'}
        onClick={() => handleStatusChange('REJECTED')}
      >
        <XCircle className="h-3 w-3" />
        Rechazar
      </Button>

      {currentStatus === 'ACCEPTED' && (
        <Button
          size="sm"
          variant="outline"
          className="gap-1"
          disabled={isPending || !!hasTalk}
          onClick={handlePromoteToTalk}
          title={hasTalk ? 'Ya tiene una charla creada' : 'Crear charla a partir de esta propuesta'}
        >
          <Mic className="h-3 w-3" />
          {hasTalk ? 'Charla creada' : 'Crear charla'}
        </Button>
      )}

      <AlertDialog>
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
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
