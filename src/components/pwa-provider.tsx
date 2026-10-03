'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { isEmbedded } from '@/components/os/os-env';

// Chromium-only event, not in the DOM typings.
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/** How to install by hand where there is no prompt to trigger (see install-app-button.tsx). */
export type InstallGuide =
  | 'ios'
  | 'android-samsung'
  | 'android-firefox'
  | 'android'
  | 'mac-safari'
  | 'desktop-firefox'
  | 'desktop-chromium';

interface PwaContextValue {
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

const PwaContext = createContext<PwaContextValue | null>(null);

// The deferred prompt lives on the top window so a page inside a PCN OS window (a same-origin
// iframe, which never gets `beforeinstallprompt`) can read and trigger the host's prompt.
type PwaWindow = Window &
  typeof globalThis & { __pcnInstallPrompt?: BeforeInstallPromptEvent | null };
const PWA_CHANGE = 'pcn-pwa-change';
const INSTALLED_KEY = 'pcn-app-installed';

const hostWindow = (): PwaWindow => {
  try {
    if (isEmbedded() && window.top) {
      void window.top.document; // throws if the parent isn't us
      return window.top as PwaWindow;
    }
  } catch {}
  return window as PwaWindow;
};

const isStandalone = (win: Window) =>
  win.matchMedia('(display-mode: standalone)').matches ||
  (win.navigator as Navigator & { standalone?: boolean }).standalone === true;

const isIos = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

const detectInstallGuide = (): InstallGuide => {
  const ua = navigator.userAgent;
  if (isIos()) return 'ios';
  if (/Android/i.test(ua)) {
    if (/SamsungBrowser/i.test(ua)) return 'android-samsung';
    if (/Firefox/i.test(ua)) return 'android-firefox';
    return 'android';
  }
  if (/Firefox/i.test(ua)) return 'desktop-firefox';
  if (/Macintosh/i.test(ua) && /Safari/i.test(ua) && !/Chrome|Chromium|Edg|OPR/i.test(ua))
    return 'mac-safari';
  return 'desktop-chromium';
};

// Remembered after `appinstalled` so this browser stops suggesting the manual steps. A prompt
// still wins: Chromium only offers one again if the app was uninstalled.
const readInstalledFlag = () => {
  try {
    return localStorage.getItem(INSTALLED_KEY) === '1';
  } catch {
    return false;
  }
};

const writeInstalledFlag = () => {
  try {
    localStorage.setItem(INSTALLED_KEY, '1');
  } catch {}
};

export function PwaProvider({ children }: { children: React.ReactNode }) {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isRunningInstalled, setIsRunningInstalled] = useState(false);
  const [wasInstalled, setWasInstalled] = useState(false);
  const [installGuide, setInstallGuide] = useState<InstallGuide | null>(null);

  useEffect(() => {
    // The app is interactive: fade out the launch screen (src/components/app-splash.tsx).
    document.documentElement.setAttribute('data-app-ready', '');

    const host = hostWindow();
    const sync = () => {
      setInstallPrompt(host.__pcnInstallPrompt ?? null);
      setIsRunningInstalled(isStandalone(host));
      setWasInstalled(readInstalledFlag());
    };
    sync();
    setInstallGuide(detectInstallGuide());
    host.addEventListener(PWA_CHANGE, sync);

    // Inside a PCN OS window the host page does the rest.
    if (host !== window) return () => host.removeEventListener(PWA_CHANGE, sync);

    const notify = () => window.dispatchEvent(new Event(PWA_CHANGE));
    const handleOnline = () => toast.success('Conexión restablecida');
    const handleOffline = () =>
      toast.error('Sin conexión', {
        description: 'Lo que ya cargó sigue disponible hasta que vuelva la red.',
      });
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      host.__pcnInstallPrompt = event as BeforeInstallPromptEvent;
      notify();
    };
    const handleAppInstalled = () => {
      host.__pcnInstallPrompt = null;
      writeInstalledFlag();
      notify();
    };
    const displayMode = window.matchMedia('(display-mode: standalone)');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    displayMode.addEventListener('change', notify);

    // In development the worker would cache stale chunks; opt in with ?sw=true to debug it.
    const register =
      process.env.NODE_ENV === 'production' ||
      new URLSearchParams(window.location.search).has('sw');
    if (register && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((error) => {
        console.error('[PWA] No se pudo registrar el service worker:', error);
      });
    }

    return () => {
      host.removeEventListener(PWA_CHANGE, sync);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      displayMode.removeEventListener('change', notify);
    };
  }, []);

  const installApp = useCallback(async () => {
    const host = hostWindow();
    const prompt = host.__pcnInstallPrompt;
    if (!prompt) return;
    // A prompt can only be shown once, whatever the user picks.
    host.__pcnInstallPrompt = null;
    host.dispatchEvent(new host.Event(PWA_CHANGE));
    await prompt.prompt();
  }, []);

  const isInstallable = !isRunningInstalled && installPrompt !== null;

  return (
    <PwaContext.Provider
      value={{
        isInstallable,
        isIosInstallable: !isRunningInstalled && installGuide === 'ios',
        canInstall:
          !isRunningInstalled && (isInstallable || (installGuide !== null && !wasInstalled)),
        installGuide,
        installApp,
      }}
    >
      {children}
    </PwaContext.Provider>
  );
}

export function usePwa() {
  const context = useContext(PwaContext);
  if (!context) throw new Error('usePwa must be used within a PwaProvider');
  return context;
}
