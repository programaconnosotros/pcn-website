'use server';

import prisma from '@/lib/prisma';
import { cookies, headers } from 'next/headers';

export const trackPageVisit = async (path: string) => {
  try {
    const sessionId = cookies().get('sessionId')?.value;
    let userId: string | undefined = undefined;
    let isAdmin = false;

    if (sessionId) {
      const session = await prisma.session.findUnique({
        where: { id: sessionId },
        include: { user: true },
      });
      if (session) {
        // Si el usuario es admin, no registrar la visita
        if (session.user.role === 'ADMIN') {
          return;
        }
        userId = session.userId;
      }
    }

    // Obtener información del request
    const headersList = headers();
    const userAgent = headersList.get('user-agent') || null;
    const referer = headersList.get('referer') || null;
    const ipAddress = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || null;

    // Registrar la visita (solo para usuarios no-admin o anónimos)
    await prisma.pageVisit.create({
      data: {
        path,
        userId: userId || null,
        userAgent,
        referer,
        ipAddress,
      },
    });
  } catch (error) {
    // Silenciar errores de tracking para no afectar la experiencia del usuario
    console.error('Error tracking page visit:', error);
  }
};


