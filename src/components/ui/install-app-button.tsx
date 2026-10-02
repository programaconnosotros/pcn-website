'use client';

import { Download, Share } from 'lucide-react';
import { usePwa } from '@/components/pwa-provider';
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
