'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { PowerOff } from 'lucide-react';
import { toast } from 'sonner';
import { deactivateAccount } from '@/actions/users/deactivate-account';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DEACTIVATION_PHRASE } from '@/lib/active-user';
import { actionErrorMessage } from '@/lib/rate-limit-messages';

const CONSEQUENCES = [
  'Se cierra tu sesión en todos los dispositivos y no vas a poder volver a entrar con esta cuenta.',
  'Tu perfil deja de aparecer en miembros, búsquedas y listas, y tus datos personales se borran.',
  'Lo que publicaste (consejos, temas, fotos, proyectos) sigue en pie, firmado como "Cuenta desactivada".',
  'Las fotos, proyectos, charlas y eventos donde estabas etiquetado siguen ahí: solo se quita tu vínculo.',
  'Salís de los eventos que vienen y tu lugar pasa a quien esté en la lista de espera.',
  'Tu email queda libre: podés crear una cuenta nueva con él cuando quieras.',
];

/** The danger zone on /perfil: deactivating your own account after confirming with your password. */
export function DeactivateAccount() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const confirmed = confirmation.trim().toLowerCase() === DEACTIVATION_PHRASE;

  const close = (next: boolean) => {
    if (isPending) return;
    setOpen(next);
    if (!next) {
      setPassword('');
      setConfirmation('');
      setError(null);
    }
  };

  const submit = () =>
    startTransition(async () => {
      try {
        const result = await deactivateAccount({ password, confirmation });
        if (!result.success) {
          setError(result.error);
          return;
        }
        toast.success('Tu cuenta quedó desactivada. ¡Gracias por haber sido parte!');
        router.replace('/');
        router.refresh();
      } catch (err) {
        setError(actionErrorMessage(err, 'No se pudo desactivar la cuenta'));
      }
    });

  return (
    <section aria-labelledby="deactivate-account" className="flex flex-col gap-3">
      <h2
        id="deactivate-account"
        className="font-mono text-xs tracking-wider text-red-400 uppercase"
      >
        {'// '}zona de peligro
      </h2>
      <p className="max-w-prose text-sm text-muted-foreground">
        Si te querés ir, podés desactivar tu cuenta. Lo que publicaste queda en la comunidad, sin tu
        nombre ni tus datos.
      </p>
      <div>
        <Button type="button" variant="destructive" size="sm" onClick={() => setOpen(true)}>
          <PowerOff className="mr-1.5 size-3.5" />
          desactivarCuenta();
        </Button>
      </div>

      <AlertDialog open={open} onOpenChange={close}>
        <AlertDialogContent>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (confirmed && password) submit();
            }}
            className="flex flex-col gap-4"
          >
            <AlertDialogHeader>
              <AlertDialogTitle>¿Desactivar tu cuenta?</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="flex flex-col gap-2">
                  <p>Esto no se puede deshacer. Al desactivarla:</p>
                  <ul className="flex list-none flex-col gap-1 font-mono text-xs">
                    {CONSEQUENCES.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span aria-hidden className="text-red-400">
                          -
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="deactivate-password">Tu contraseña</Label>
              <Input
                id="deactivate-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="deactivate-confirmation">
                Escribí <span className="font-mono text-red-400">{DEACTIVATION_PHRASE}</span> para
                confirmar
              </Label>
              <Input
                id="deactivate-confirmation"
                autoComplete="off"
                spellCheck={false}
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
              />
            </div>
            {error && (
              <p role="alert" className="font-mono text-xs text-red-400">
                {error}
              </p>
            )}

            <AlertDialogFooter>
              <AlertDialogCancel disabled={isPending}>cancelar();</AlertDialogCancel>
              <Button
                type="submit"
                variant="destructive"
                disabled={!confirmed || !password}
                loading={isPending}
                loadingText="desactivando..."
              >
                desactivarCuenta();
              </Button>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
