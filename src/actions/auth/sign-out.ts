'use server';

import { deleteCurrentSession } from '@/lib/session';

/**
 * Closes the current session. It doesn't redirect: called from the client, a server action that
 * redirects rejects its promise, so the "cerrando sesión" toast showed an error even though the
 * session was gone. The caller navigates once this resolves (see `signOutAndGo`).
 */
export const signOut = async () => {
  await deleteCurrentSession();
  return { success: true as const };
};
