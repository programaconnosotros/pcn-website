'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { logClientError } from '@/actions/errors/log-error';
import { TerminalErrorScreen } from '@/components/errors/terminal-error-screen';

export default function PlatformError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname() ?? '/';

  useEffect(() => {
    logClientError({
      message: error.message,
      stack: error.stack,
      path: pathname,
      metadata: { digest: error.digest, boundary: 'app/(platform)/error.tsx' },
    }).catch(() => {});
  }, [error, pathname]);

  return (
    <TerminalErrorScreen
      code="500"
      command={`./render ${pathname}`}
      output={[
        'Segmentation fault (core dumped)',
        error.digest ? `digest: ${error.digest}` : 'Algo salió mal al cargar esta página.',
      ]}
      action={
        <button
          type="button"
          onClick={reset}
          className="self-start border border-pcnGreen-400 px-3 py-1.5 text-xs text-pcnGreen transition-colors hover:bg-pcnGreen/10"
        >
          <span className="text-pcnGreen-600">$ </span>
          reintentar
        </button>
      }
    />
  );
}
