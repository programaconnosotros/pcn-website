import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '../ui/input';

const AddAdvise = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="mb-4 w-full">
          <PlusCircle className="mr-2 h-4 w-4" />
          Postear un consejo
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Postear un consejo</DialogTitle>
        </DialogHeader>

        <Input placeholder="Escribí acá tu consejo..." />

        <Button>Postear</Button>
      </DialogContent>
    </Dialog>
  );
};

export default AddAdvise;
