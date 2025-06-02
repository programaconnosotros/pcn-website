'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const signOut = async () => {
  await cookies().delete('sessionId');
  redirect('/autenticacion/iniciar-sesion');
};
