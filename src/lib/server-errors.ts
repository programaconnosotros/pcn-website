import prisma from '@/lib/prisma';
import { alertServerError } from '@/lib/security-alerts';
import { clientIpFrom } from '@/lib/client-ip';

// Every error the server hits while answering a request (a page or layout render, a route
// handler, a server action), recorded in ErrorLog for /monitoreo. Called from `onRequestError`
// in src/instrumentation.ts, so no action has to wrap itself to be logged. Server-only.

type RequestInfo = {
  path: string;
  method: string;
  headers: Record<string, string | string[] | undefined>;
};

type ErrorContext = {
  routerKind: string;
  routePath: string;
  routeType: string;
};

/** At most this many rows a minute: an error on every request shouldn't flood the table. */
const MAX_PER_MINUTE = 30;
let windowStart = 0;
let recorded = 0;

const allow = (now = Date.now()) => {
  if (now - windowStart >= 60_000) {
    windowStart = now;
    recorded = 0;
  }
  recorded += 1;
  return recorded <= MAX_PER_MINUTE;
};

const header = (headers: RequestInfo['headers'], name: string) => {
  const value = headers[name];
  return Array.isArray(value) ? value[0] : value;
};

/** For tests: start counting from zero. */
export const resetServerErrorThrottle = () => {
  windowStart = 0;
  recorded = 0;
};

export const recordServerError = async (
  error: unknown,
  request: RequestInfo,
  context: ErrorContext,
) => {
  if (!allow()) return;
  const message = (error instanceof Error ? error.message : String(error)).slice(0, 2000);
  const digest = (error as { digest?: unknown } | null)?.digest;
  const path = request.path.slice(0, 500);
  try {
    await prisma.errorLog.create({
      data: {
        message,
        stack: error instanceof Error ? (error.stack?.slice(0, 10000) ?? null) : null,
        path,
        userAgent: header(request.headers, 'user-agent')?.slice(0, 500) ?? null,
        ipAddress: clientIpFrom({ get: (name) => header(request.headers, name) ?? null }),
        metadata: JSON.stringify({
          source: 'onRequestError',
          method: request.method,
          route: context.routePath,
          routeType: context.routeType,
          routerKind: context.routerKind,
          ...(typeof digest === 'string' && { digest }),
        }),
      },
    });
    await alertServerError(message, path);
  } catch (logError) {
    // The database may be what failed: the error still reaches the server's own log.
    console.error('Could not record a server error:', logError, 'original:', error);
  }
};
