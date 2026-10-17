'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackPageVisit } from '@/actions/analytics/track-page-visit';
import { isOsHost } from '@/components/os/os-env';

export function PageVisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // En PCN OS cada ventana trackea su propia visita; el escritorio no cuenta como visita.
    if (isOsHost()) return;
    // Solo trackear rutas principales (no API routes, etc)
    if (pathname && !pathname.startsWith('/api') && !pathname.startsWith('/_next')) {
      trackPageVisit(pathname);
    }
  }, [pathname]);

  return null;
}
