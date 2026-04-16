'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';

type Props = {
  open: boolean;
  onClose: () => void;
  eventName: string;
};

export function WaitlistSuccessDialog({ open, onClose, eventName }: Props) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
            <Clock className="h-10 w-10 text-pcnPurple dark:text-pcnGreen" />
          </div>
          <DialogTitle className="text-center text-xl">¡Te uniste a la lista de espera!</DialogTitle>
          <DialogDescription className="text-center">
            Estás en la lista de espera de <strong>{eventName}</strong>. Te inscribiremos
            automáticamente cuando se libere un lugar y te avisaremos por email.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center pt-4">
          <Button variant="pcn" onClick={onClose}>
            Entendido
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
