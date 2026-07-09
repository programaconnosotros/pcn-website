'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface PwaContextType {
  isInstallable: boolean;
  isStandalone: boolean;
  isOnline: boolean;
  installApp: () => Promise<void>;
}

const PwaContext = createContext<PwaContextType | undefined>(undefined);

export function PwaProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // 1. Detectar si la app corre instalada (Standalone)
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone ||
        document.referrer.includes('android-app://');
      setIsStandalone(isStandaloneMode);
    };

    checkStandalone();

    // 2. Estado de la conexión a internet
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Conexión restablecida', {
        description: 'Vuelves a estar online. Disfruta de la experiencia completa.',
        duration: 4000,
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error('Sin conexión a internet', {
        description: 'Has entrado en modo offline. Los contenidos cargados seguirán disponibles.',
        duration: 5000,
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 3. Capturar el prompt de instalación PWA
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 4. Registro de Service Worker con soporte de depuración (?sw=true en URL en local)
    const isDev = process.env.NODE_ENV === 'development';
    const forceSwInDev = typeof window !== 'undefined' && window.location.search.includes('sw=true');
    const shouldRegisterSw = 'serviceWorker' in navigator && (!isDev || forceSwInDev);

    if (shouldRegisterSw) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          if (forceSwInDev) {
            console.log('[PCN PWA] Service Worker registrado en desarrollo:', registration.scope);
          }

          // Escuchar cambios de estado para actualizaciones found
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                    // Nueva versión instalada y esperando activación. Mostrar toast premium.
                    toast.info('Actualización disponible', {
                      description: 'Hay mejoras listas para instalar en la plataforma.',
                      action: {
                        label: 'Actualizar',
                        onClick: () => {
                          newWorker.postMessage({ type: 'SKIP_WAITING' });
                        },
                      },
                      duration: 12000,
                    });
                  }
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('[PCN PWA] Error al registrar el Service Worker:', error);
        });

      // Escuchar cuando el nuevo SW tome el control y recargar la página inmediatamente
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) {
      console.warn('[PCN PWA] El prompt de instalación no está disponible aún.');
      return;
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`[PCN PWA] El usuario respondió al prompt de instalación: ${outcome}`);
    } catch (err) {
      console.error('[PCN PWA] Error al intentar instalar la aplicación:', err);
    } finally {
      setDeferredPrompt(null);
      setIsInstallable(false);
    }
  };

  return (
    <PwaContext.Provider value={{ isInstallable, isStandalone, isOnline, installApp }}>
      {children}
    </PwaContext.Provider>
  );
}

export function usePwa() {
  const context = useContext(PwaContext);
  if (context === undefined) {
    throw new Error('usePwa debe ser usado dentro de un PwaProvider');
  }
  return context;
}
