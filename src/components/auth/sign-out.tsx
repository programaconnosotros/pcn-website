import { signOut } from '@/auth';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export const SignOut = () => (
  <form
    action={async () => {
      'use server';
      await signOut({ redirectTo: '/' });
    }}
  >
    <Button className="flex gap-2" type="submit">
      Salir <LogOut className="mr-2 h-4 w-4" />
    </Button>
  </form>
);
