'use client';

import { AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { resolveSystemAlert } from '@/actions/system-alerts/resolve-system-alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { actionErrorMessage } from '@/lib/rate-limit-messages';

type Alert = { id: string; kind: string; detail: string; createdAt: Date | string };

const COPY: Record<string, { title: string; body: string; fix: string; href?: string }> = {
  email_quota: {
    title: 'No están saliendo los emails',
    body: 'Resend se quedó sin cuota: no llegan los códigos para verificar la cuenta ni para recuperar la contraseña, ni los avisos de eventos. A quien lo intenta le decimos que lo estamos solucionando.',
    fix: 'Ampliá el plan de Resend (o esperá a que se renueve la cuota) y marcalo como resuelto.',
    href: 'https://resend.com/settings/billing',
  },
};

const fallbackCopy = {
  title: 'Problema en la plataforma',
  body: 'Hay un problema que necesita que lo resuelva un admin.',
  fix: 'Revisalo y marcalo como resuelto.',
};

// "Later" holds for this browser session only: the dialog is back on the next visit.
const DISMISSED_KEY = 'pcn:system-alerts-dismissed';

const readDismissed = (): string[] => {
  try {
    return JSON.parse(sessionStorage.getItem(DISMISSED_KEY) ?? '[]');
  } catch {
    return [];
  }
};

/**
 * The critical dialog an admin sees as soon as they enter the platform while a platform problem
 * is open (see src/lib/system-alerts.ts). Not inside PCN OS windows: the desktop shows it once.
 */
export function SystemAlertDialog({ alerts }: { alerts: Alert[] }) {
  const router = useRouter();
  const [dismissed, setDismissed] = useState<string[] | null>(null);
  const [isResolving, startResolving] = useTransition();

  useEffect(() => {
    setDismissed(document.documentElement.hasAttribute('data-embedded') ? null : readDismissed());
  }, []);

  const alert = dismissed && alerts.find((candidate) => !dismissed.includes(candidate.id));
  if (!alert) return null;
  const copy = COPY[alert.kind] ?? fallbackCopy;

  const later = () => {
    const next = [...(dismissed ?? []), alert.id];
    setDismissed(next);
    try {
      sessionStorage.setItem(DISMISSED_KEY, JSON.stringify(next));
    } catch {
      // Sin storage, "más tarde" vale hasta recargar.
    }
  };

  const resolve = () =>
    startResolving(async () => {
      try {
        await resolveSystemAlert(alert.id);
        toast.success('Marcado como resuelto');
        setDismissed((current) => [...(current ?? []), alert.id]);
        router.refresh();
      } catch (error) {
        toast.error(actionErrorMessage(error, 'No se pudo marcar como resuelto'));
      }
    });

  return (
    <AlertDialog open onOpenChange={(open) => !open && later()}>
      <AlertDialogContent className="border-destructive">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="size-5 shrink-0" />
            Crítico: {copy.title}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2">
              <p>{copy.body}</p>
              <p className="font-medium text-foreground">{copy.fix}</p>
              <p className="font-mono text-xs">
                desde el {new Date(alert.createdAt).toLocaleString('es-AR')} · {alert.detail}
              </p>
              {'href' in copy && copy.href && (
                <a
                  href={copy.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block font-mono text-xs text-pcnGreen underline"
                >
                  abrir Resend ↗
                </a>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={later} disabled={isResolving}>
            más tarde
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault();
              resolve();
            }}
            disabled={isResolving}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isResolving ? 'guardando...' : 'ya lo resolví'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
