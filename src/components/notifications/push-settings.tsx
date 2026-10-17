'use client';

import { useEffect, useState, useTransition } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { actionErrorMessage } from '@/lib/rate-limit-messages';
import {
  currentSubscription,
  pushSupport,
  turnOffPush,
  turnOnPush,
  type PushSupport,
} from '@/lib/push-client';

type State = 'loading' | PushSupport | 'denied' | 'off' | 'on';

const STATUS: Record<State, string> = {
  loading: '…',
  supported: 'desactivadas',
  off: 'desactivadas',
  on: 'activadas en este dispositivo',
  denied: 'bloqueadas en este navegador',
  unsupported: 'no disponibles en este navegador',
  'needs-install': 'requieren instalar el sitio',
};

// Push notifications in this browser: new events, changes to the ones you're going to, replies to
// you in the forum and new job offers, even with the site closed. Each device is turned on apart.
export function PushSettings({ publicKey }: { publicKey: string }) {
  const [state, setState] = useState<State>('loading');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const support = pushSupport();
    if (support !== 'supported') return setState(support);
    if (Notification.permission === 'denied') return setState('denied');
    currentSubscription()
      .then((subscription) => setState(subscription ? 'on' : 'off'))
      .catch(() => setState('off'));
  }, []);

  const run = (work: () => Promise<void>) =>
    startTransition(async () => {
      try {
        await work();
      } catch (error) {
        toast.error(actionErrorMessage(error, 'No se pudieron cambiar las notificaciones'));
      }
    });

  const turnOn = () =>
    run(async () => {
      const permission = await turnOnPush(publicKey);
      if (permission === 'granted') {
        setState('on');
        toast.success('Notificaciones push activadas');
      } else if (permission === 'denied') {
        setState('denied');
      }
    });

  const turnOff = () =>
    run(async () => {
      await turnOffPush();
      setState('off');
      toast.success('Notificaciones push desactivadas');
    });

  return (
    <section aria-labelledby="push-title" className="flex flex-col gap-3">
      <header className="flex items-center gap-2">
        {state === 'on' ? (
          <Bell className="size-4 text-pcnGreen" aria-hidden />
        ) : (
          <BellOff className="size-4 text-muted-foreground" aria-hidden />
        )}
        <h2 id="push-title" className="font-mono text-sm text-foreground">
          notificaciones push
        </h2>
        <span className="font-mono text-[11px] text-muted-foreground">{STATUS[state]}</span>
      </header>

      <p className="text-sm text-foreground/90">
        Te avisamos en este dispositivo, aunque no tengas el sitio abierto, cuando se publica un
        evento, cambia uno al que te anotaste, te responden en el foro o hay una oferta de empleo
        nueva.
      </p>

      {state === 'needs-install' && (
        <p className="text-sm text-muted-foreground">
          En iPhone y iPad, primero agregá el sitio a la pantalla de inicio (compartir → “Agregar a
          inicio”) y activalas desde ahí.
        </p>
      )}
      {state === 'denied' && (
        <p className="text-sm text-muted-foreground">
          Las bloqueaste para este sitio. Para activarlas, permití las notificaciones en la
          configuración del navegador y recargá la página.
        </p>
      )}

      {(state === 'off' || state === 'on') && (
        <div>
          {state === 'off' ? (
            <Button
              type="button"
              variant="pcn"
              size="sm"
              loading={isPending}
              loadingText="activando..."
              onClick={turnOn}
            >
              activar();
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              loading={isPending}
              loadingText="desactivando..."
              onClick={turnOff}
            >
              desactivar
            </Button>
          )}
        </div>
      )}
    </section>
  );
}
