'use client';

import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Plus, LogIn, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { User } from '@prisma/client';

interface NewPostButtonProps {
  user: User | null;
}

export function NewPostButton({ user }: NewPostButtonProps) {
  if (user) {
    return (
      <Button asChild>
        <Link href={'/foro/nuevo-post'} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Post
        </Link>
      </Button>
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Post
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¡Registrate o Inicia Sesión!</AlertDialogTitle>
          <AlertDialogDescription>
            Para crear un nuevo post necesitas estar registrado en la plataforma. Puedes crear una
            cuenta nueva o iniciar sesión si ya tienes una.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-col gap-2 sm:flex-row">
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Link href="/autenticacion/registro" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Registrarse
            </Link>
          </AlertDialogAction>
          <AlertDialogAction asChild>
            <Link href="/autenticacion/iniciar-sesion" className="flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              Iniciar Sesión
            </Link>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
