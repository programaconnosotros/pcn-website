'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackPageVisit } from '@/actions/analytics/track-page-visit';

export function PageVisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Solo trackear rutas principales (no API routes, etc)
    if (pathname && !pathname.startsWith('/api') && !pathname.startsWith('/_next')) {
      trackPageVisit(pathname);
    }
  }, [pathname]);

  return null;
}
