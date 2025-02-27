'use client';

import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useState } from 'react';
import { AdviseForm, AdviseFormProps } from './advise-form';

export const AddAdvise = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const addAdviseOptions = {
    mode: "create",
    setDialogOpen: setDialogOpen
  } as AdviseFormProps

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Publicar un consejo
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Publicar un consejo</DialogTitle>
        </DialogHeader>
        <AdviseForm {...addAdviseOptions} />
      </DialogContent>
    </Dialog>
  );
};
