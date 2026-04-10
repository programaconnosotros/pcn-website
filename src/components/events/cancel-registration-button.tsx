'use client';

import { Button } from '@/components/ui/button';
import { cancelRegistration } from '@/actions/events/cancel-registration';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

type CancelRegistrationButtonProps = {
  eventId: string;
  registrationId?: string;
  onCancel?: () => void;
  mode?: 'registration' | 'waitlist';
};

export function CancelRegistrationButton({
  eventId,
  registrationId,
  onCancel,
  mode = 'registration',
}: CancelRegistrationButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleCancel = async () => {
    setIsLoading(true);
    try {
      await toast.promise(
        cancelRegistration({
          registrationId,
          eventId,
        }),
        {
          loading:
            mode === 'waitlist' ? 'Saliendo de la lista de espera...' : 'Cancelando inscripción...',
          success:
            mode === 'waitlist'
              ? 'Saliste de la lista de espera exitosamente'
              : 'Inscripción cancelada exitosamente',
          error: (error) => {
            console.error('Error al cancelar inscripción', error);
            return error.message || 'Ocurrió un error al cancelar la inscripción';
          },
        },
      );
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
      {mode === 'waitlist' ? 'Salir de lista de espera' : 'Cancelar inscripción'}
    </Button>
  );
}
