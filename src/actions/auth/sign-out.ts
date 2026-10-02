'use server';

import { redirect } from 'next/navigation';
import { deleteCurrentSession } from '@/lib/session';

export const signOut = async () => {
  await deleteCurrentSession();
  redirect('/autenticacion/iniciar-sesion');
};
