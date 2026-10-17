'use client';

import { useState, type ReactNode } from 'react';
import { Download, Share } from 'lucide-react';
import { usePwa, type InstallGuide } from '@/components/pwa-context';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

// Install entry for the sidebar and the mobile menu. Chromium gives us a prompt to trigger;
// iOS Safari has none, so there we explain the manual steps. Renders nothing once installed.
export function InstallAppButton({ className }: { className?: string }) {
  const { isInstallable, isIosInstallable, installApp } = usePwa();

  if (isInstallable)
    return (
      <button
        type="button"
        onClick={installApp}
        className={cn(
          'flex h-8 w-full items-center justify-center gap-1.5 rounded-sm border border-pcnGreen-300 font-mono text-[11px] font-medium text-pcnGreen transition-colors hover:bg-pcnGreen/[0.08]',
          className,
        )}
      >
        <Download className="size-3.5" strokeWidth={1.75} />
        Instalar app
      </button>
    );

  if (isIosInstallable)
    return (
      <p
        className={cn(
          'flex items-center gap-1.5 rounded-sm border border-dashed border-pcnGreen-200 px-2 py-1.5 font-mono text-[11px] text-sidebar-foreground/55',
          className,
        )}
      >
        <Share className="size-3.5 shrink-0" strokeWidth={1.75} />
        <span>
          Instalá la app: <span className="text-pcnGreen">Compartir → Agregar a inicio</span>
        </span>
      </p>
    );

  return null;
}

const Key = ({ children }: { children: ReactNode }) => (
  <span className="whitespace-nowrap text-pcnGreen">{children}</span>
);

/** Manual install steps per browser, for when there is no prompt to trigger. */
const GUIDES: Record<InstallGuide, { browser: string; steps: ReactNode[]; note?: string }> = {
  ios: {
    browser: 'iPhone / iPad',
    steps: [
      <>
        Tocá <Key>Compartir</Key> (el cuadrado con la flecha hacia arriba).
      </>,
      <>
        Elegí <Key>Agregar a inicio</Key> (bajá en la lista si no aparece).
      </>,
      <>
        Confirmá con <Key>Agregar</Key>.
      </>,
    ],
    note: 'Funciona desde Safari y, en iOS 16.4 o posterior, también desde Chrome o Edge.',
  },
  'android-samsung': {
    browser: 'Samsung Internet',
    steps: [
      <>
        Abrí el menú <Key>≡</Key> abajo a la derecha.
      </>,
      <>
        Tocá <Key>Agregar página a</Key> → <Key>Pantalla de inicio</Key>.
      </>,
    ],
  },
  'android-firefox': {
    browser: 'Firefox para Android',
    steps: [
      <>
        Abrí el menú <Key>⋮</Key>.
      </>,
      <>
        Tocá <Key>Instalar</Key> o <Key>Agregar a pantalla de inicio</Key>.
      </>,
    ],
  },
  android: {
    browser: 'Android',
    steps: [
      <>
        Abrí el menú <Key>⋮</Key> del navegador.
      </>,
      <>
        Tocá <Key>Instalar app</Key> o <Key>Agregar a pantalla de inicio</Key>.
      </>,
    ],
  },
  'mac-safari': {
    browser: 'Safari en macOS',
    steps: [
      <>
        En la barra de menú, abrí <Key>Archivo</Key>.
      </>,
      <>
        Elegí <Key>Agregar al Dock</Key> y confirmá.
      </>,
    ],
    note: 'Necesita macOS Sonoma (Safari 17) o posterior.',
  },
  'desktop-firefox': {
    browser: 'Firefox',
    steps: [
      <>
        Firefox de escritorio no instala apps web: abrí <Key>programaconnosotros.com</Key> en{' '}
        <Key>Chrome</Key> o <Key>Edge</Key>.
      </>,
      <>
        Hacé clic en el ícono <Key>Instalar</Key> de la barra de direcciones.
      </>,
    ],
  },
  'desktop-chromium': {
    browser: 'Chrome / Edge',
    steps: [
      <>
        Hacé clic en el ícono <Key>Instalar</Key> a la derecha de la barra de direcciones.
      </>,
      <>
        Si no aparece: menú <Key>⋮</Key> → <Key>Transmitir, guardar y compartir</Key> →{' '}
        <Key>Instalar página como app</Key> (en Edge: <Key>Apps</Key> →{' '}
        <Key>Instalar este sitio como app</Key>).
      </>,
    ],
  },
};

/**
 * Install call to action for the home hero. Where the browser offers a prompt (Chromium) one
 * click installs; elsewhere it opens the manual steps for that browser. Hidden when the app is
 * already installed.
 */
export function HeroInstallButton({ className }: { className?: string }) {
  const { canInstall, isInstallable, installGuide, installApp } = usePwa();
  const [showGuide, setShowGuide] = useState(false);

  if (!canInstall) return null;

  const guide = installGuide ? GUIDES[installGuide] : null;

  return (
    <>
      <button
        type="button"
        onClick={() => (isInstallable ? installApp() : setShowGuide(true))}
        className={cn(
          'inline-flex group items-center gap-2.5 text-left font-mono text-xs text-muted-foreground transition-colors animate-in fade-in hover:text-pcnGreen',
          className,
        )}
      >
        <span className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-sm border border-pcnGreen-300 bg-black/50 px-2 text-pcnGreen transition-colors group-hover:border-pcnGreen group-hover:bg-pcnGreen/10">
          <Download className="size-3.5" strokeWidth={1.75} />
          instalarApp();
        </span>
        <span>Tené PCN a un toque, como cualquier app</span>
      </button>

      {guide && (
        <Dialog open={showGuide} onOpenChange={setShowGuide}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Instalar PCN</DialogTitle>
              <DialogDescription>
                Desde {guide.browser}. Queda en tu inicio o tu dock y se abre a pantalla completa.
              </DialogDescription>
            </DialogHeader>
            <ol className="space-y-2.5 text-[13px] leading-relaxed text-muted-foreground">
              {guide.steps.map((step, index) => (
                <li key={index} className="flex gap-3">
                  <span aria-hidden className="shrink-0 text-pcnGreen-600 select-none">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="text-pretty">{step}</span>
                </li>
              ))}
            </ol>
            {guide.note && (
              <p className="border-t border-dashed border-pcnGreen-200 pt-3 text-[11px] text-muted-foreground/70">
                {`// ${guide.note}`}
              </p>
            )}
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
