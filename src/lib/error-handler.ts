import { logClientError } from '@/actions/errors/log-error';
import { isRedirectError } from 'next/dist/client/components/redirect-error';

export { isRedirectError };

// Server errors don't need a wrapper: onRequestError (src/instrumentation.ts) records every one.

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
