import { signOut } from '@/actions/auth/sign-out';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export const SignOut = () => (
  <form action={signOut} className="mt-4">
    <Button className="flex w-full gap-2 sm:w-auto" type="submit" variant="outline">
      Cerrar sesión <LogOut className="mr-2 h-4 w-4" />
    </Button>
  </form>
);
