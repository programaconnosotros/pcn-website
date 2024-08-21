import { signOut } from '@/auth';
import { Button } from '@/components/ui/button';

export const SignOut = () => (
  <form
    action={async () => {
      'use server';
      await signOut({ redirectTo: '/' });
    }}
  >
    <Button type="submit">Cerrar sesión</Button>
  </form>
);
