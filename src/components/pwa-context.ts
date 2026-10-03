'use client';

import { createContext, useContext } from 'react';

// The PWA install state PwaProvider shares. Kept out of pwa-provider.tsx so that file only exports
// a component and editing it keeps Fast Refresh working instead of reloading the page.

/** How to install by hand where there is no prompt to trigger (see install-app-button.tsx). */
export type InstallGuide =
  | 'ios'
  | 'android-samsung'
  | 'android-firefox'
  | 'android'
  | 'mac-safari'
  | 'desktop-firefox'
  | 'desktop-chromium';

export interface PwaContextValue {
  /** The browser offered an install prompt we can trigger (Chromium). */
  isInstallable: boolean;
  /** iOS Safari: no prompt, installing is Compartir → Agregar a inicio. */
  isIosInstallable: boolean;
  /** Not installed (or not running installed) and there is a way to install: prompt or guide. */
  canInstall: boolean;
  /** Manual steps for this browser, used when there is no prompt. */
  installGuide: InstallGuide | null;
  installApp: () => Promise<void>;
}

export const PwaContext = createContext<PwaContextValue | null>(null);

export function usePwa() {
  const context = useContext(PwaContext);
  if (!context) throw new Error('usePwa must be used within a PwaProvider');
  return context;
}
