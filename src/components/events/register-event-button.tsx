'use client';

import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { registerEvent } from '@/actions/events/register-event';
import { checkEventCapacity } from '@/actions/events/check-event-capacity';

type RegisterEventButtonProps = {
  eventId: string;
  isAuthenticated: boolean;
  capacityAvailable: boolean;
  onSuccess?: () => void;
  isLoading?: boolean;
};

export function RegisterEventButton({
  eventId,
  isAuthenticated,
  capacityAvailable,
  onSuccess,
  isLoading = false,
}: RegisterEventButtonProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClick = async () => {
    // Si no está autenticado, redirigir a login con autoRegister
    if (!isAuthenticated) {
      router.push(`/autenticacion/iniciar-sesion?redirect=/eventos/${eventId}&autoRegister=true`);
      return;
    }

    // Si no hay cupo disponible, no hacer nada
    if (!capacityAvailable) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Validar cupo antes de inscribir
      const capacityCheck = await checkEventCapacity(eventId);
      if (!capacityCheck.available) {
        toast.error(
          capacityCheck.message ||
            'El cupo del evento está completo. No se pueden aceptar más inscripciones.',
        );
        setIsSubmitting(false);
        return;
      }

      await registerEvent(eventId, { skipRedirect: true });

      // Notificar éxito
      if (onSuccess) {
        onSuccess();
      } else {
        toast.success('¡Te has inscrito exitosamente al evento! 🎉');
        router.refresh();
      }
    } catch (error: any) {
      console.error('Error al inscribirse al evento:', error);
      toast.error(error.message || 'Ocurrió un error al inscribirse al evento');
    } finally {
      setIsSubmitting(false);
    }
  };

  const buttonIsLoading = isSubmitting || isLoading;

  return (
    <Button
      variant="pcn"
      className="flex w-full items-center gap-2"
      onClick={handleClick}
      disabled={buttonIsLoading || !capacityAvailable}
    >
      <UserPlus className="h-4 w-4" />
      {buttonIsLoading ? 'Inscribiéndote...' : 'Inscribirme al evento'}
    </Button>
  );
}
