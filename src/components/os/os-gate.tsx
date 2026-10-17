'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useOsMode } from './use-os-mode';

/**
 * Renders the classic site (sidebar + page) only when PCN OS is not active. On the desktop
 * host the pages live inside windows instead, so the classic tree is unmounted to avoid
 * running its effects twice.
 */
export function OsGate({ children }: { children: React.ReactNode }) {
  const isOs = useOsMode();
  const router = useRouter();
  const wasOs = useRef(false);

  useEffect(() => {
    // The desktop rewrites the URL to follow the focused window. When the screen shrinks back
    // to the classic layout, refetch so the rendered page matches the address bar.
    if (wasOs.current && !isOs) router.refresh();
    wasOs.current = isOs;
  }, [isOs, router]);

  return isOs ? null : <>{children}</>;
}
