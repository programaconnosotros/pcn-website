'use server';

import prisma from '@/lib/prisma';
import { cookies, headers } from 'next/headers';
import { enforceRateLimit } from '@/lib/rate-limit';
import { findSession } from '@/lib/session';

// Tope de cada campo: estas actions se pueden llamar sin login, así que nadie debería poder
// guardar textos gigantes en la base.
const clip = (value: string | null | undefined, max: number) =>
  value ? value.slice(0, max) : null;

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export const logClient = async (data: {
  level: LogLevel;
  message: string;
  path?: string;
  metadata?: Record<string, any>;
}) => {
  // Pasado el límite se descarta en silencio: loguear no puede romper la página
  try {
    await enforceRateLimit('log');
  } catch {
    return;
  }

  try {
    const sessionId = (await cookies()).get('sessionId')?.value;
    let userId: string | undefined = undefined;

    if (sessionId) {
      const session = await findSession(sessionId);
      if (session) {
        // No loguear logs de admins
        if (session.user.role === 'ADMIN') {
          return;
        }
        userId = session.userId;
      }
    }

    // Obtener información del request
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || null;
    const ipAddress = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || null;

    await prisma.appLog.create({
      data: {
        level: data.level,
        message: clip(data.message, 2000) ?? '',
        path: clip(data.path, 500),
        userId: userId || null,
        userAgent,
        ipAddress,
        metadata: data.metadata ? clip(JSON.stringify(data.metadata), 10000) : null,
      },
    });
  } catch (logError) {
    // Silenciar errores de logging para no crear un loop infinito
    console.error('Error logging client log:', logError);
  }
};
