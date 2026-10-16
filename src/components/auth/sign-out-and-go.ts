import { toast } from 'sonner';
import { signOut } from '@/actions/auth/sign-out';
import { notifyOsSessionChange } from '@/components/os/os-env';

type Router = { push: (_href: string) => void; refresh: () => void };

/**
 * Signs out with a toast, tells PCN OS (when inside one of its windows) to reload who it shows,
 * and goes to the sign-in page.
 */
export const signOutAndGo = (router: Router) =>
  toast.promise(
    signOut().then(() => {
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
