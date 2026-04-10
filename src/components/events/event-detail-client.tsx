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
  isWaitlisted: boolean;
  waitlistPosition: number | null;
  registrationId: string | null;
  capacityAvailable: boolean;
  capacityInfo: {
    current: number;
    capacity: number;
    available: boolean;
    waitlistCount: number;
  } | null;
};

export function EventDetailClient({
  eventId,
  eventName,
  isAuthenticated,
  isRegistered: initialIsRegistered,
  isWaitlisted: initialIsWaitlisted,
  waitlistPosition,
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
  const [justWaitlistedLocally, setJustWaitlistedLocally] = useState(false);

  const autoRegister = searchParams.get('autoRegister') === 'true';
  const justRegistered = searchParams.get('registered') === 'true';
  const justWaitlisted = searchParams.get('waitlisted') === 'true';

  // El usuario está registrado si viene del server O si se registró localmente
  const isRegistered = initialIsRegistered || justRegisteredLocally;
  const isWaitlisted = !isRegistered && (initialIsWaitlisted || justWaitlistedLocally);

  // Mostrar dialog si viene con registered=true o toast si viene con waitlisted=true
  useEffect(() => {
    if (justRegistered) {
      setShowSuccessDialog(true);
      setJustRegisteredLocally(true);
      setJustWaitlistedLocally(false);
      // Limpiar URL sin recargar
      router.replace(`/eventos/${eventId}`, { scroll: false });
    }
    if (justWaitlisted) {
      toast.success('Te sumaste a la lista de espera de este evento.');
      setJustWaitlistedLocally(true);
      router.replace(`/eventos/${eventId}`, { scroll: false });
    }
  }, [justRegistered, justWaitlisted, eventId, router]);

  // Auto-registrar si viene de login/registro
  useEffect(() => {
    if (autoRegister && isAuthenticated && !isRegistered && !isWaitlisted && !hasAutoRegistered) {
      const performAutoRegister = async () => {
        setHasAutoRegistered(true);
        setIsAutoRegistering(true);

        try {
          const result = await registerEvent(eventId, { skipRedirect: true });

          router.replace(`/eventos/${eventId}`, { scroll: false });
          if (result.status === 'registered') {
            setJustRegisteredLocally(true);
            setShowSuccessDialog(true);
            setJustWaitlistedLocally(false);
          } else {
            setJustWaitlistedLocally(true);
            toast.success('Te sumaste a la lista de espera de este evento.');
          }
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
  }, [
    autoRegister,
    isAuthenticated,
    isRegistered,
    isWaitlisted,
    hasAutoRegistered,
    eventId,
    router,
  ]);

  const handleRegistrationSuccess = (status: 'registered' | 'waitlisted') => {
    if (status === 'registered') {
      setJustRegisteredLocally(true);
      setJustWaitlistedLocally(false);
      setShowSuccessDialog(true);
      return;
    }

    setJustWaitlistedLocally(true);
    toast.success('Te sumaste a la lista de espera de este evento.');
  };

  const handleDialogClose = () => {
    setShowSuccessDialog(false);
    // Hacer refresh para actualizar la UI del servidor
    router.refresh();
  };

  const handleCancellation = () => {
    // Resetear el estado local para mostrar el botón de inscripción
    setJustRegisteredLocally(false);
    setJustWaitlistedLocally(false);
  };

  // Renderizar según el estado
  if (isRegistered) {
    return (
      <>
        <div className="space-y-3">
          <div className="space-y-2">
            <p className="text-center text-sm font-medium">Ya estás registrado</p>
            <p className="text-center text-xs text-muted-foreground">Te esperamos en el evento</p>
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

  if (isWaitlisted) {
    return (
      <div className="space-y-3">
        <div className="space-y-2">
          <p className="text-center text-sm font-medium">Estás en lista de espera</p>
          <p className="text-center text-xs text-muted-foreground">
            Te avisaremos cuando se libere un cupo.
            {waitlistPosition ? ` Tu posición actual es #${waitlistPosition}.` : ''}
          </p>
        </div>
        <CancelRegistrationButton
          eventId={eventId}
          registrationId={registrationId || undefined}
          onCancel={handleCancellation}
          mode="waitlist"
        />
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
            {capacityInfo.available
              ? `Quedan ${capacityInfo.capacity - capacityInfo.current} lugares disponibles.`
              : `Cupo completo. ${capacityInfo.waitlistCount} personas en lista de espera.`}
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
