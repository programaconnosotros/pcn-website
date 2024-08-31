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
import { AddAdviseDialogForm } from './add-advise-dialog-form';

export const AddAdvise = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

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
        <AddAdviseDialogForm setDialogOpen={setDialogOpen} />
      </DialogContent>
    </Dialog>
  );
};
