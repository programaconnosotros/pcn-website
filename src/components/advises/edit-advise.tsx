'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AdviseForm, AdviseFormProps } from './advise-form';

export interface EditAdviseDialogProps {
  adviseId: string;
  initialContent: string;
  isOpen: boolean;
  setDialogOpen: (open: boolean) => void;
}

export const EditAdvise = ({
  adviseId,
  initialContent,
  isOpen,
  setDialogOpen,
}: EditAdviseDialogProps) => {
  const editAdviseOptions = { 
    mode: "edit",
    adviseId,
    initialContent,
    setDialogOpen 
  } as AdviseFormProps

  return (
    <Dialog open={isOpen} onOpenChange={setDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar consejo</DialogTitle>
        </DialogHeader>
        <AdviseForm {...editAdviseOptions} />
      </DialogContent>
    </Dialog>
  );
};
