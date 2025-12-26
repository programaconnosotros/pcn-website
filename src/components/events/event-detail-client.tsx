'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { registerEvent } from '@/actions/events/register-event';
import { RegistrationSuccessDialog } from './registration-success-dialog';
import { RegisterEventButton } from './register-event-button';
import { CancelRegistrationButton } from './cancel-registration-button';
import { toast } from 'sonner';

type Props = {
  eventId: string;
  eventName: string;
  isAuthenticated: boolean;
  isRegistered: boolean;
  registrationId: string | null;
  capacityAvailable: boolean;
  capacityInfo: {
    current: number;
    capacity: number;
    available: boolean;
  } | null;
};

export function EventDetailClient({
  eventId,
  eventName,
  isAuthenticated,
  isRegistered: initialIsRegistered,
  registrationId,
  capacityAvailable,
  capacityInfo,
}: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [hasAutoRegistered, setHasAutoRegistered] = useState(false);
  const [isAutoRegistering, setIsAutoRegistering] = useState(false);
  // Estado local para saber si ya se registró en esta sesión
  const [justRegisteredLocally, setJustRegisteredLocally] = useState(false);

  const autoRegister = searchParams.get('autoRegister') === 'true';
  const justRegistered = searchParams.get('registered') === 'true';

  // El usuario está registrado si viene del server O si se registró localmente
  const isRegistered = initialIsRegistered || justRegisteredLocally;

  // Mostrar dialog si viene con registered=true
  useEffect(() => {
    if (justRegistered) {
      setShowSuccessDialog(true);
      setJustRegisteredLocally(true);
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
          setJustRegisteredLocally(true);
          setShowSuccessDialog(true);
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
    setJustRegisteredLocally(true);
    setShowSuccessDialog(true);
  };

  const handleDialogClose = () => {
    setShowSuccessDialog(false);
    // Hacer refresh para actualizar la UI del servidor
    router.refresh();
  };

  const handleCancellation = () => {
    // Resetear el estado local para mostrar el botón de inscripción
    setJustRegisteredLocally(false);
  };

  // Renderizar según el estado
  if (isRegistered) {
    return (
      <>
        <div className="space-y-3">
          <div className="space-y-2">
            <p className="text-center text-sm font-medium">Ya estás registrado</p>
            <p className="text-center text-xs text-muted-foreground">
              Te esperamos en el evento
            </p>
          </div>
          <CancelRegistrationButton
            eventId={eventId}
            registrationId={registrationId || undefined}
            onCancel={handleCancellation}
          />
        </div>
        
        <RegistrationSuccessDialog
          open={showSuccessDialog}
          onClose={handleDialogClose}
          eventName={eventName}
        />
      </>
    );
  }

  if (capacityInfo && !capacityInfo.available) {
    return (
      <div className="space-y-2">
        <p className="text-center text-sm font-medium text-destructive">
          Cupo completo
        </p>
        <p className="text-center text-xs text-muted-foreground">
          Ya no quedan lugares disponibles.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        <RegisterEventButton
          eventId={eventId}
          isAuthenticated={isAuthenticated}
          capacityAvailable={capacityAvailable}
          onSuccess={handleRegistrationSuccess}
          isLoading={isAutoRegistering}
        />
        {capacityInfo && (
          <p className="text-center text-xs text-muted-foreground">
            Quedan {capacityInfo.capacity - capacityInfo.current} lugares disponibles.
          </p>
        )}
      </div>
      
      <RegistrationSuccessDialog
        open={showSuccessDialog}
        onClose={handleDialogClose}
        eventName={eventName}
      />
    </>
  );
}


