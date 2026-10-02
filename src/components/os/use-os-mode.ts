'use client';

import { useSyncExternalStore } from 'react';
import { OS_MEDIA_QUERY, isOsHost } from './os-env';

const subscribe = (onChange: () => void) => {
  const mediaQuery = window.matchMedia(OS_MEDIA_QUERY);
  mediaQuery.addEventListener('change', onChange);
  return () => mediaQuery.removeEventListener('change', onChange);
};

/**
 * Whether this document should render as the PCN OS desktop. Always false during SSR and
 * hydration, so markup that must be visible before hydration relies on the `os:` variant.
 */
export const useOsMode = () => useSyncExternalStore(subscribe, isOsHost, () => false);
