import { PlusCircle } from 'lucide-react';
import { Button } from '../ui/button';

const AddAdvise = () => {
  return (
    <Button className="mb-4 w-full">
      <PlusCircle className="mr-2 h-4 w-4" />
      Postear un consejo
    </Button>
  );
};

export default AddAdvise;
