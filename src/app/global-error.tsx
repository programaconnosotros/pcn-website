'use client';

import { useEffect } from 'react';
import { logClientError } from '@/actions/errors/log-error';
import { TerminalErrorScreen } from '@/components/errors/terminal-error-screen';
import { FATAL_TAB_TITLE } from '@/lib/tab-title';
import './globals.css';

// Last-resort boundary for errors in the root layout itself; it replaces the whole document.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // What the browser saw; a server-side error behind it is also in ErrorLog via onRequestError.
  useEffect(() => {
    logClientError({
      message: error.message,
      stack: error.stack,
      path: window.location.pathname,
      metadata: { digest: error.digest, boundary: 'app/global-error.tsx' },
    }).catch(() => {});
  }, [error]);

  return (
    <html lang="es" className="dark">
      {/* It replaces the root layout, so the metadata title is gone too. */}
      <head>
        <title>{FATAL_TAB_TITLE}</title>
      </head>
      <body className="flex min-h-dvh flex-col bg-black text-foreground">
        <TerminalErrorScreen
          code="500"
          command="./boot pcn_os"
          output={['Kernel panic - not syncing: el sitio no pudo arrancar.']}
          action={
            <button
              type="button"
              onClick={reset}
              className="self-start border border-pcnGreen-400 px-3 py-1.5 text-xs text-pcnGreen transition-colors hover:bg-pcnGreen/10"
            >
              <span className="text-pcnGreen-600">$ </span>
              reiniciar
            </button>
          }
        />
      </body>
    </html>
  );
}
