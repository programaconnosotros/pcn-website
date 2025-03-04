import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export const getCurrentSession = async () => {
  const sessionId = cookies().get('sessionId')?.value;

  if (!sessionId) return null;

  return prisma.session.findUnique({
    where: {
      id: sessionId,
    },
    include: {
      user: true,
    },
  });
};
