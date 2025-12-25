'use server';

import prisma from '@/lib/prisma';
import { cookies, headers } from 'next/headers';

type ErrorLogData = {
  message: string;
  stack?: string;
  path?: string;
  metadata?: Record<string, any>;
};

/**
 * Log error from server-side code
 */
export const logError = async (error: Error | unknown, additionalData?: { path?: string; metadata?: Record<string, any> }) => {
  try {
    const sessionId = cookies().get('sessionId')?.value;
    let userId: string | undefined = undefined;

    if (sessionId) {
      const session = await prisma.session.findUnique({
        where: { id: sessionId },
        include: { user: true },
      });
      if (session) {
        // No loguear errores de admins
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

    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    await prisma.errorLog.create({
      data: {
        message: errorMessage,
        stack: errorStack,
        path: additionalData?.path || null,
        userId: userId || null,
        userAgent,
        ipAddress,
        metadata: additionalData?.metadata ? JSON.stringify(additionalData.metadata) : null,
      },
    });
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
  try {
    const sessionId = cookies().get('sessionId')?.value;
    let userId: string | undefined = undefined;

    if (sessionId) {
      const session = await prisma.session.findUnique({
        where: { id: sessionId },
        include: { user: true },
      });
      if (session) {
        // No loguear errores de admins
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

    await prisma.errorLog.create({
      data: {
        message: errorData.message,
        stack: errorData.stack || null,
        path: errorData.path || null,
        userId: userId || null,
        userAgent,
        ipAddress,
        metadata: errorData.metadata ? JSON.stringify(errorData.metadata) : null,
      },
    });
  } catch (logError) {
    // Silenciar errores de logging para no crear un loop infinito
    console.error('Error logging client error:', logError);
  }
};

