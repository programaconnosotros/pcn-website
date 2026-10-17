import { toast } from 'sonner';
import { signOut } from '@/actions/auth/sign-out';
import { notifyOsSessionChange } from '@/components/os/os-env';
import { pushSupport, turnOffPush } from '@/lib/push-client';

type Router = { push: (_href: string) => void; refresh: () => void };

// Push notifications stay with the member, not the device: on a shared computer they'd keep
// arriving after signing out. Never holds up signing out.
const forgetPush = () =>
  pushSupport() === 'supported' ? turnOffPush().catch(() => undefined) : Promise.resolve();

/**
 * Signs out with a toast, turns push off in this browser, tells PCN OS (when inside one of its
 * windows) to reload who it shows, and goes to the sign-in page.
 */
export const signOutAndGo = (router: Router) =>
  toast.promise(
    forgetPush()
      .then(() => signOut())
      .then(() => {
        notifyOsSessionChange();
        router.push('/iniciar-sesion');
        router.refresh();
      }),
    {
      loading: 'Cerrando sesión...',
      success: 'Sesión cerrada correctamente',
      error: 'Error al cerrar sesión',
    },
  );
