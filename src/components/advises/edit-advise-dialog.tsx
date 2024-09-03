'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AdviseForm } from './advise-form';

export interface EditAdviseDialogProps {
  adviseId: string;
  initialContent: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditAdviseDialog = ({
  adviseId,
  initialContent,
  isOpen,
  onOpenChange,
}: EditAdviseDialogProps) => {
  const editAdviseOptions = { adviseId, initialContent, isOpen, onOpenChange }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar consejo</DialogTitle>
        </DialogHeader>
        <AdviseForm editAdviseOptions={editAdviseOptions} />
      </DialogContent>
    </Dialog>
  );
};
