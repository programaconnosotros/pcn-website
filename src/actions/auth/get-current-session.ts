import { cookies } from 'next/headers';
import { findSession } from '@/lib/session';

export const getCurrentSession = async () => {
  const sessionId = (await cookies()).get('sessionId')?.value;

  if (!sessionId) return null;

  return findSession(sessionId);
};
