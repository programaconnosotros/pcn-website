'use client';

import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { registerEvent } from '@/actions/events/register-event';

type RegisterEventButtonProps = {
  eventId: string;
  isAuthenticated: boolean;
  capacityAvailable: boolean;
  onSuccess?: (status: 'registered' | 'waitlisted') => void;
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

    setIsSubmitting(true);

    try {
      const result = await registerEvent(eventId, { skipRedirect: true });

      // Notificar éxito
      if (onSuccess) {
        onSuccess(result.status);
      } else {
        if (result.status === 'registered') {
          toast.success('¡Te has inscrito exitosamente al evento! 🎉');
        } else {
          toast.success('Te sumaste a la lista de espera del evento.');
        }
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
      disabled={buttonIsLoading}
    >
      <UserPlus className="h-4 w-4" />
      {buttonIsLoading
        ? 'Procesando...'
        : capacityAvailable
          ? 'Inscribirme al evento'
          : 'Sumarme a lista de espera'}
    </Button>
  );
}
