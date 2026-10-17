'use client';

import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useRealtime, type RealtimeMessage } from './use-realtime';

const KIND_LABELS: Record<string, string> = {
  evento: 'Nuevo evento',
  charla: 'Nueva charla',
  fotos: 'Fotos nuevas',
  setup: 'Nuevo setup',
  proyecto: 'Nuevo proyecto',
  foro: 'Nuevo tema en el foro',
  consejo: 'Nuevo consejo',
};

const isEmbedded = () =>
  typeof document !== 'undefined' && document.documentElement.hasAttribute('data-embedded');

/**
 * A toast whenever something new shows up in the community (src/lib/realtime-signals.ts), with a
 * link to it. Not on /feed, which shows its own banner, nor inside PCN OS windows, where the
 * desktop around them already tells.
 */
export function LiveNews() {
  const pathname = usePathname();
  const router = useRouter();

  useRealtime(['feed'], ({ data }: RealtimeMessage) => {
    if (pathname === '/feed' || isEmbedded()) return;
    const title = typeof data?.title === 'string' ? data.title : null;
    const href = typeof data?.href === 'string' && data.href.startsWith('/') ? data.href : null;
    if (!title || !href) return;
    toast(KIND_LABELS[String(data?.kind)] ?? 'Novedad en la comunidad', {
      description: title,
      action: { label: 'ver', onClick: () => router.push(href) },
    });
  });

  return null;
}
