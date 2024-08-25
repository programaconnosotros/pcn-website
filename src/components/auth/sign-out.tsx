import { signOut } from '@/actions/auth/sign-out';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export const SignOut = () => (
  <form action={signOut}>
    <Button className="flex gap-2" type="submit">
      Cerrar sesión <LogOut className="mr-2 h-4 w-4" />
    </Button>
  </form>
);
