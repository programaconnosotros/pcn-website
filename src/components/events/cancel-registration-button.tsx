'use client';

import { Button } from '@/components/ui/button';
import { cancelRegistration } from '@/actions/events/cancel-registration';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { actionErrorMessage } from '@/lib/rate-limit-messages';

type CancelRegistrationButtonProps = {
  eventId: string;
  registrationId?: string;
  onCancel?: () => void;
  // 'waitlist' para salir de la lista de espera en vez de cancelar una inscripción
  mode?: 'registration' | 'waitlist';
};

export function CancelRegistrationButton({
  eventId,
  registrationId,
  onCancel,
  mode = 'registration',
}: CancelRegistrationButtonProps) {
  const isWaitlist = mode === 'waitlist';
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
          loading: isWaitlist ? 'Saliendo de la lista de espera...' : 'Cancelando inscripción...',
          success: isWaitlist
            ? 'Saliste de la lista de espera'
            : 'Inscripción cancelada exitosamente',
          error: (error) => {
            console.error('Error al cancelar inscripción', error);
            return actionErrorMessage(error, 'Ocurrió un error al cancelar la inscripción', true);
          },
        },
      );
      if (onCancel) {
        onCancel();
      }
      router.refresh();
    } catch {
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
      loading={isLoading}
      loadingText={isWaitlist ? 'saliendo...' : 'cancelando...'}
    >
      <X className="mr-2 h-4 w-4" />
      {isWaitlist ? 'salirDeLaListaDeEspera();' : 'cancelarInscripcion();'}
    </Button>
  );
}
