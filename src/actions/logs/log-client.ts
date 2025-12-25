'use server';

import prisma from '@/lib/prisma';
import { cookies, headers } from 'next/headers';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export const logClient = async (data: {
  level: LogLevel;
  message: string;
  path?: string;
  metadata?: Record<string, any>;
}) => {
  try {
    const sessionId = cookies().get('sessionId')?.value;
    let userId: string | undefined = undefined;

    if (sessionId) {
      const session = await prisma.session.findUnique({
        where: { id: sessionId },
        include: { user: true },
      });
      if (session) {
        // No loguear logs de admins
        if (session.user.role === 'ADMIN') {
          return;
        }
        userId = session.userId;
      }
    }

    // Obtener información del request
    const headersList = headers();
    const userAgent = headersList.get('user-agent') || null;
    const ipAddress = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || null;

    await prisma.appLog.create({
      data: {
        level: data.level,
        message: data.message,
        path: data.path || null,
        userId: userId || null,
        userAgent,
        ipAddress,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      },
    });
  } catch (logError) {
    // Silenciar errores de logging para no crear un loop infinito
    console.error('Error logging client log:', logError);
  }
};


