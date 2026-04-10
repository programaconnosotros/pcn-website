'use client';

import { Button } from '@/components/ui/button';
import { cancelWaitlist } from '@/actions/events/cancel-waitlist';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

type CancelWaitlistButtonProps = {
  eventId: string;
  onCancel?: () => void;
};

export function CancelWaitlistButton({ eventId, onCancel }: CancelWaitlistButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleCancel = async () => {
    setIsLoading(true);
    try {
      await toast.promise(cancelWaitlist({ eventId }), {
        loading: 'Saliendo de la lista de espera...',
        success: 'Saliste de la lista de espera exitosamente',
        error: (error) => {
          console.error('Error al salir de la lista de espera', error);
          return error.message || 'Ocurrió un error al salir de la lista de espera';
        },
      });
      if (onCancel) {
        onCancel();
      }
      router.refresh();
    } catch (error) {
      // El error ya se maneja en toast.promise
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="w-full"
      onClick={handleCancel}
      disabled={isLoading}
    >
      <X className="mr-2 h-4 w-4" />
      Salir de la lista de espera
    </Button>
  );
}
