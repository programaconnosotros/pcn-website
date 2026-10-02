'use client';

import { Button } from '@/components/ui/button';
import { UserPlus, ExternalLink, Loader2, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { registerEvent, type RegistrationResult } from '@/actions/events/register-event';
import { actionErrorMessage } from '@/lib/rate-limit-messages';

type RegisterEventButtonProps = {
  eventId: string;
  isAuthenticated: boolean;
  // Sin cupo, el botón anota en la lista de espera en vez de inscribir
  capacityAvailable: boolean;
  onSuccess?: (_result: RegistrationResult) => void;
  isLoading?: boolean;
  externalUrl?: string;
  label?: string;
};

export function RegisterEventButton({
  eventId,
  isAuthenticated,
  capacityAvailable,
  onSuccess,
  isLoading = false,
  externalUrl,
  label,
}: RegisterEventButtonProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClick = async () => {
    if (externalUrl) {
      window.open(externalUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    // Si no está autenticado, redirigir a login con autoRegister
    if (!isAuthenticated) {
      router.push(`/autenticacion/iniciar-sesion?redirect=/eventos/${eventId}&autoRegister=true`);
      return;
    }

    setIsSubmitting(true);

    try {
      // El servidor decide si hay lugar o si va a la lista de espera
      const result = await registerEvent(eventId, { skipRedirect: true });

      // Notificar éxito
      if (onSuccess) {
        onSuccess(result);
      } else {
        toast.success(
          result.status === 'waitlisted'
            ? `Te sumaste a la lista de espera (#${result.position})`
            : '¡Te has inscrito exitosamente al evento! 🎉',
        );
        router.refresh();
      }
    } catch (error: any) {
      console.error('Error al inscribirse al evento:', error);
      toast.error(actionErrorMessage(error, 'Ocurrió un error al inscribirse al evento', true));
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
      disabled={!externalUrl && buttonIsLoading}
    >
      {buttonIsLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : externalUrl ? (
        <ExternalLink className="h-4 w-4" />
      ) : !capacityAvailable ? (
        <Clock className="h-4 w-4" />
      ) : (
        <UserPlus className="h-4 w-4" />
      )}
      {!externalUrl && buttonIsLoading
        ? 'inscribiendo...'
        : label ?? (capacityAvailable ? 'inscribirme();' : 'unirmeAListaDeEspera();')}
    </Button>
  );
}
