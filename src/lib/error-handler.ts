import { logError, logClientError } from '@/actions/errors/log-error';

/**
 * Wrapper para server actions que captura y registra errores automáticamente
 */
export async function withErrorLogging<T>(
  action: () => Promise<T>,
  context?: { path?: string; metadata?: Record<string, any> },
): Promise<T> {
  try {
    return await action();
  } catch (error) {
    // Logear el error
    await logError(error, context);
    // Re-lanzar el error para que se maneje normalmente
    throw error;
  }
}

/**
 * Helper para capturar errores de promesas en el cliente
 */
export async function catchClientError(
  error: unknown,
  context?: { path?: string; metadata?: Record<string, any> },
) {
  if (typeof window !== 'undefined') {
    const errorData = {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      path: context?.path || window.location.pathname,
      metadata: context?.metadata,
    };

    // Usar server action en lugar de API route
    await logClientError(errorData).catch(() => {
      // Silenciar errores de logging
    });
  }
}
