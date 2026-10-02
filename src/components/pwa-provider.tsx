'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { isEmbedded } from '@/components/os/os-env';

// Chromium-only event, not in the DOM typings.
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PwaContextValue {
  /** The browser offered an install prompt we can trigger (Chromium). */
  isInstallable: boolean;
  /** iOS Safari: no prompt, installing is Compartir → Agregar a inicio. */
  isIosInstallable: boolean;
  installApp: () => Promise<void>;
}

const PwaContext = createContext<PwaContextValue | null>(null);

const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;

const isIos = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

export function PwaProvider({ children }: { children: React.ReactNode }) {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIosInstallable, setIsIosInstallable] = useState(false);

  useEffect(() => {
    // Inside a PCN OS window the host page already does all of this.
    if (isEmbedded()) return;

    setIsIosInstallable(isIos() && !isStandalone());

    const handleOnline = () => toast.success('Conexión restablecida');
    const handleOffline = () =>
      toast.error('Sin conexión', {
        description: 'Lo que ya cargó sigue disponible hasta que vuelva la red.',
      });
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };
    const handleAppInstalled = () => setInstallPrompt(null);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

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
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = useCallback(async () => {
    if (!installPrompt) return;
    // A prompt can only be shown once, whatever the user picks.
    setInstallPrompt(null);
    await installPrompt.prompt();
  }, [installPrompt]);

  return (
    <PwaContext.Provider
      value={{ isInstallable: installPrompt !== null, isIosInstallable, installApp }}
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
