'use client';

import { TerminalErrorScreen } from '@/components/errors/terminal-error-screen';
import './globals.css';

// Last-resort boundary for errors in the root layout itself; it replaces the whole document.
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="es" className="dark">
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
