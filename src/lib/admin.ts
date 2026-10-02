import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/actions/auth/get-current-session';

/** The logged-in user when they are an admin, otherwise null. */
export const getAdminUser = async () => {
  const session = await getCurrentSession();
  return session?.user.role === 'ADMIN' ? session.user : null;
};

/** For server actions: throws unless the caller is an admin. */
export const requireAdmin = async () => {
  const admin = await getAdminUser();
  if (!admin) throw new Error('No autorizado');
  return admin;
};

/** For admin pages and layouts: sends everyone else to the home page. */
export const requireAdminPage = async () => {
  const admin = await getAdminUser();
  if (!admin) redirect('/home');
  return admin;
};
