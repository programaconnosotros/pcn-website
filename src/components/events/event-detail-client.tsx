'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { registerEvent } from '@/actions/events/register-event';
import { RegistrationSuccessDialog } from './registration-success-dialog';
import { RegisterEventButton } from './register-event-button';
import { toast } from 'sonner';

type Props = {
  eventId: string;
  eventName: string;
  isAuthenticated: boolean;
  isRegistered: boolean;
  capacityAvailable: boolean;
};

export function EventDetailClient({
  eventId,
  eventName,
  isAuthenticated,
  isRegistered,
  capacityAvailable,
}: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [hasAutoRegistered, setHasAutoRegistered] = useState(false);
  const [isAutoRegistering, setIsAutoRegistering] = useState(false);

  const autoRegister = searchParams.get('autoRegister') === 'true';
  const justRegistered = searchParams.get('registered') === 'true';

  // Mostrar dialog si viene con registered=true
  useEffect(() => {
    if (justRegistered) {
      setShowSuccessDialog(true);
      // Limpiar URL sin recargar
      router.replace(`/eventos/${eventId}`, { scroll: false });
    }
  }, [justRegistered, eventId, router]);

  // Auto-registrar si viene de login/registro
  useEffect(() => {
    if (autoRegister && isAuthenticated && !isRegistered && !hasAutoRegistered && capacityAvailable) {
      const performAutoRegister = async () => {
        setHasAutoRegistered(true);
        setIsAutoRegistering(true);
        
        try {
          await registerEvent(eventId, { skipRedirect: true });
          
          // Limpiar URL y mostrar dialog
          router.replace(`/eventos/${eventId}`, { scroll: false });
          setShowSuccessDialog(true);
          router.refresh();
        } catch (error: any) {
          toast.error(error.message || 'Error al inscribirse automáticamente');
          router.replace(`/eventos/${eventId}`, { scroll: false });
        } finally {
          setIsAutoRegistering(false);
        }
      };

      performAutoRegister();
    } else if (autoRegister && !isAuthenticated) {
      // Limpiar URL si no está autenticado
      router.replace(`/eventos/${eventId}`, { scroll: false });
    }
  }, [autoRegister, isAuthenticated, isRegistered, hasAutoRegistered, eventId, capacityAvailable, router]);

  const handleRegistrationSuccess = () => {
    setShowSuccessDialog(true);
    router.refresh();
  };

  return (
    <>
      <RegisterEventButton
        eventId={eventId}
        isAuthenticated={isAuthenticated}
        capacityAvailable={capacityAvailable}
        onSuccess={handleRegistrationSuccess}
        isLoading={isAutoRegistering}
      />
      
      <RegistrationSuccessDialog
        open={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}
        eventName={eventName}
      />
    </>
  );
}


