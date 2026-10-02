'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock } from 'lucide-react';

type Props = {
  open: boolean;
  onClose: () => void;
  eventName: string;
  // Si viene, la persona quedó en la lista de espera en esa posición
  waitlistPosition?: number | null;
};

export function RegistrationSuccessDialog({ open, onClose, eventName, waitlistPosition }: Props) {
  const isWaitlisted = waitlistPosition != null;
  const Icon = isWaitlisted ? Clock : CheckCircle2;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <Icon className="h-10 w-10 text-pcnPurple dark:text-pcnGreen" />
          </div>
          <DialogTitle className="text-center text-xl">
            {isWaitlisted ? 'Estás en la lista de espera' : '¡Te has inscrito exitosamente! 🎉'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {isWaitlisted ? (
              <>
                El cupo de <strong>{eventName}</strong> está completo y tu lugar en la fila es el #
                {waitlistPosition}. Si se libera un lugar, te inscribimos automáticamente y te
                avisamos por email.
              </>
            ) : (
              <>
                Ya estás registrado en <strong>{eventName}</strong>. ¡Te esperamos!
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center pt-4">
          <Button variant="pcn" onClick={onClose}>
            entendido();
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
