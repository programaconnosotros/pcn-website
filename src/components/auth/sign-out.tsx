import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const SignOut = () => (
  <form
    action={async () => {
      'use server';

      cookies().delete('sessionId');
      redirect('/auth/sign-in');
    }}
    className="mt-4"
  >
    <Button className="flex w-full gap-2 sm:w-auto" type="submit" variant="outline">
      Cerrar sesión <LogOut className="mr-2 h-4 w-4" />
    </Button>
  </form>
);
