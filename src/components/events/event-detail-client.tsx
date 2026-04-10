'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { registerEvent } from '@/actions/events/register-event';
import { RegistrationSuccessDialog } from './registration-success-dialog';
import { WaitlistSuccessDialog } from './waitlist-success-dialog';
import { RegisterEventButton } from './register-event-button';
import { CancelRegistrationButton } from './cancel-registration-button';
import { CancelWaitlistButton } from './cancel-waitlist-button';
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
  isOnWaitlist: boolean;
  waitlistPosition: number | null;
  waitlistCount: number;
};

export function EventDetailClient({
  eventId,
  eventName,
  isAuthenticated,
  isRegistered: initialIsRegistered,
  registrationId,
  capacityAvailable,
  capacityInfo,
  isOnWaitlist: initialIsOnWaitlist,
  waitlistPosition,
  waitlistCount,
}: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showRegistrationDialog, setShowRegistrationDialog] = useState(false);
  const [showWaitlistDialog, setShowWaitlistDialog] = useState(false);
  const [hasAutoRegistered, setHasAutoRegistered] = useState(false);
  const [isAutoRegistering, setIsAutoRegistering] = useState(false);
  const [justRegisteredLocally, setJustRegisteredLocally] = useState(false);
  const [justWaitlistedLocally, setJustWaitlistedLocally] = useState(false);

  const autoRegister = searchParams.get('autoRegister') === 'true';
  const justRegistered = searchParams.get('registered') === 'true';
  const justWaitlisted = searchParams.get('waitlisted') === 'true';

  const isRegistered = initialIsRegistered || justRegisteredLocally;
  const isOnWaitlist = initialIsOnWaitlist || justWaitlistedLocally;

  // Mostrar dialog si viene con registered=true o waitlisted=true
  useEffect(() => {
    if (justRegistered) {
      setShowRegistrationDialog(true);
      setJustRegisteredLocally(true);
      router.replace(`/eventos/${eventId}`, { scroll: false });
    }
    if (justWaitlisted) {
      setShowWaitlistDialog(true);
      setJustWaitlistedLocally(true);
      router.replace(`/eventos/${eventId}`, { scroll: false });
    }
  }, [justRegistered, justWaitlisted, eventId, router]);

  // Auto-registrar si viene de login/registro
  useEffect(() => {
    if (autoRegister && isAuthenticated && !isRegistered && !isOnWaitlist && !hasAutoRegistered) {
      const performAutoRegister = async () => {
        setHasAutoRegistered(true);
        setIsAutoRegistering(true);

        try {
          const result = await registerEvent(eventId, { skipRedirect: true });

          router.replace(`/eventos/${eventId}`, { scroll: false });

          if (result.status === 'waitlisted') {
            setJustWaitlistedLocally(true);
            setShowWaitlistDialog(true);
          } else {
            setJustRegisteredLocally(true);
            setShowRegistrationDialog(true);
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
      router.replace(`/eventos/${eventId}`, { scroll: false });
    }
  }, [autoRegister, isAuthenticated, isRegistered, isOnWaitlist, hasAutoRegistered, eventId, router]);

  const handleRegistrationSuccess = (status: 'registered' | 'waitlisted') => {
    if (status === 'waitlisted') {
      setJustWaitlistedLocally(true);
      setShowWaitlistDialog(true);
    } else {
      setJustRegisteredLocally(true);
      setShowRegistrationDialog(true);
    }
  };

  const handleDialogClose = () => {
    setShowRegistrationDialog(false);
    setShowWaitlistDialog(false);
    router.refresh();
  };

  const handleCancellation = () => {
    setJustRegisteredLocally(false);
  };

  const handleWaitlistCancellation = () => {
    setJustWaitlistedLocally(false);
  };

  // Estado 1: Ya inscrito
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
          open={showRegistrationDialog}
          onClose={handleDialogClose}
          eventName={eventName}
        />
      </>
    );
  }

  // Estado 2: En la lista de espera
  if (isOnWaitlist) {
    return (
      <>
        <div className="space-y-3">
          <div className="space-y-2">
            <p className="text-center text-sm font-medium">Estás en la lista de espera</p>
            {waitlistPosition !== null && (
              <p className="text-center text-xs text-muted-foreground">
                Eres #{waitlistPosition} en la lista de espera
              </p>
            )}
            <p className="text-center text-xs text-muted-foreground">
              Te inscribiremos automáticamente cuando se libere un lugar
            </p>
          </div>
          <CancelWaitlistButton eventId={eventId} onCancel={handleWaitlistCancellation} />
        </div>

        <WaitlistSuccessDialog
          open={showWaitlistDialog}
          onClose={handleDialogClose}
          eventName={eventName}
        />
      </>
    );
  }

  // Estado 3: Cupo completo, puede unirse a la lista de espera
  if (capacityInfo && !capacityInfo.available) {
    return (
      <>
        <div className="space-y-3">
          <div className="space-y-2">
            <p className="text-center text-sm font-medium text-destructive">Cupo completo</p>
            {waitlistCount > 0 && (
              <p className="text-center text-xs text-muted-foreground">
                {waitlistCount} {waitlistCount === 1 ? 'persona' : 'personas'} en lista de espera
              </p>
            )}
          </div>
          <RegisterEventButton
            eventId={eventId}
            isAuthenticated={isAuthenticated}
            capacityAvailable={true}
            mode="waitlist"
            onSuccess={handleRegistrationSuccess}
            isLoading={isAutoRegistering}
          />
        </div>

        <WaitlistSuccessDialog
          open={showWaitlistDialog}
          onClose={handleDialogClose}
          eventName={eventName}
        />
      </>
    );
  }

  // Estado 4: Puede inscribirse
  return (
    <>
      <div className="space-y-3">
        <RegisterEventButton
          eventId={eventId}
          isAuthenticated={isAuthenticated}
          capacityAvailable={capacityAvailable}
          mode="register"
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
        open={showRegistrationDialog}
        onClose={handleDialogClose}
        eventName={eventName}
      />
    </>
  );
}
