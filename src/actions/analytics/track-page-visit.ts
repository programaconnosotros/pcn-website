'use server';

import prisma from '@/lib/prisma';
import { cookies, headers } from 'next/headers';
import { findSession } from '@/lib/session';
import { clientIpFrom } from '@/lib/client-ip';
import { enforceRateLimit } from '@/lib/rate-limit';

// Se llama sin login desde cada página: nadie debería poder llenar la tabla con rutas gigantes.
const MAX_LENGTH = 500;
const clip = (value: string | null) => (value ? value.slice(0, MAX_LENGTH) : null);

export const trackPageVisit = async (path: string) => {
  if (typeof path !== 'string' || !path.startsWith('/')) return;

  // Pasado el límite se descarta en silencio: el tracking no puede romper la página
  try {
    await enforceRateLimit('pageVisit');
  } catch {
    return;
  }

  try {
    const sessionId = (await cookies()).get('sessionId')?.value;
    let userId: string | undefined = undefined;
    if (sessionId) {
      const session = await findSession(sessionId);
      // Las de admins también se guardan: las lecturas las excluyen salvo que /metricas pida
      // contarlas (src/lib/page-visit-filters.ts).
      if (session) userId = session.userId;
    }

    // Obtener información del request
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || null;
    const referer = headersList.get('referer') || null;
    const ipAddress = clientIpFrom(headersList);

    // Registrar la visita
    await prisma.pageVisit.create({
      data: {
        path: path.slice(0, MAX_LENGTH),
        userId: userId || null,
        userAgent: clip(userAgent),
        referer: clip(referer),
        ipAddress,
      },
    });
  } catch (error) {
    // Silenciar errores de tracking para no afectar la experiencia del usuario
    console.error('Error tracking page visit:', error);
  }
};
