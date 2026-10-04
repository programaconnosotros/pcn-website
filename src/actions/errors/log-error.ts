'use server';

import prisma from '@/lib/prisma';
import { cookies, headers } from 'next/headers';
import { enforceRateLimit } from '@/lib/rate-limit';
import { findSession } from '@/lib/session';
import { clientIpFrom } from '@/lib/client-ip';
import { alertServerError } from '@/lib/security-alerts';

// Tope de cada campo: estas actions se pueden llamar sin login, así que nadie debería poder
// guardar textos gigantes en la base.
const clip = (value: string | null | undefined, max: number) =>
  value ? value.slice(0, max) : null;

/**
 * Log error from server-side code
 */
export const logError = async (
  error: Error | unknown,
  additionalData?: { path?: string; metadata?: Record<string, any> },
) => {
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
        // No loguear errores de admins
        if (session.user.role === 'ADMIN') {
          return;
        }
        userId = session.userId;
      }
    }

    // Obtener información del request
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || null;
    const ipAddress = clientIpFrom(headersList);

    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    await prisma.errorLog.create({
      data: {
        message: clip(errorMessage, 2000) ?? '',
        stack: clip(errorStack, 10000),
        path: clip(additionalData?.path, 500),
        userId: userId || null,
        userAgent,
        ipAddress,
        metadata: additionalData?.metadata
          ? clip(JSON.stringify(additionalData.metadata), 10000)
          : null,
      },
    });

    await alertServerError(errorMessage, additionalData?.path);
  } catch (logError) {
    // Silenciar errores de logging para no crear un loop infinito
    console.error('Error logging error:', logError);
  }
};

/**
 * Log error from client-side code
 */
export const logClientError = async (errorData: {
  message: string;
  stack?: string;
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
        // No loguear errores de admins
        if (session.user.role === 'ADMIN') {
          return;
        }
        userId = session.userId;
      }
    }

    // Obtener información del request
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || null;
    const ipAddress = clientIpFrom(headersList);

    await prisma.errorLog.create({
      data: {
        message: clip(errorData.message, 2000) ?? '',
        stack: clip(errorData.stack, 10000),
        path: clip(errorData.path, 500),
        userId: userId || null,
        userAgent,
        ipAddress,
        metadata: errorData.metadata ? clip(JSON.stringify(errorData.metadata), 10000) : null,
      },
    });
  } catch (logError) {
    // Silenciar errores de logging para no crear un loop infinito
    console.error('Error logging client error:', logError);
  }
};
