'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

type Props = {
  open: boolean;
  onClose: () => void;
  eventName: string;
};

export function RegistrationSuccessDialog({ open, onClose, eventName }: Props) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle2 className="h-10 w-10 text-pcnPurple dark:text-pcnGreen" />
          </div>
          <DialogTitle className="text-center text-xl">
            ¡Te has inscrito exitosamente! 🎉
          </DialogTitle>
          <DialogDescription className="text-center">
            Ya estás registrado en <strong>{eventName}</strong>. ¡Te esperamos!
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
