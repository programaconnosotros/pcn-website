// Server-only: problems with the platform itself that an admin has to fix. Opened by the code
// that runs into them (e.g. sendEmail when Resend is out of quota); admins see a critical dialog
// while one is open (SystemAlertDialog) and close it from there.

import { notifyUsers } from '@/actions/notifications/notify-users';
import { cached } from '@/lib/cache';
import prisma from '@/lib/prisma';

export const EMAIL_QUOTA_ALERT = 'email_quota';

/**
 * Opens the "Resend is out of quota" alert and tells every admin in the app, once: while it's
 * open, more failures add nothing. Never throws: it runs while some email is failing.
 */
export const reportEmailQuotaExceeded = async (detail: string) => {
  try {
    const open = await prisma.systemAlert.findFirst({
      where: { kind: EMAIL_QUOTA_ALERT, resolvedAt: null },
      select: { id: true },
    });
    if (open) return;

    await prisma.systemAlert.create({ data: { kind: EMAIL_QUOTA_ALERT, detail } });
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN', suspendedAt: null },
      select: { id: true },
    });
    await notifyUsers(
      admins.map((admin) => admin.id),
      {
        type: 'email_quota_exceeded',
        title: 'Resend se quedó sin cuota de emails',
        message:
          'No están saliendo los emails de la plataforma (verificación de cuenta, recuperar contraseña, avisos de eventos). Ampliá el plan de Resend o esperá a que se renueve la cuota.',
        href: '/monitoreo',
        metadata: { detail },
      },
    );
  } catch (error) {
    console.error('Error reporting the email quota alert:', error);
  }
};

/** The open alerts, oldest first. Cached: every admin's page load reads it. */
export const getOpenSystemAlerts = cached(
  'open-system-alerts',
  () =>
    prisma.systemAlert.findMany({
      where: { resolvedAt: null },
      orderBy: { createdAt: 'asc' },
      select: { id: true, kind: true, detail: true, createdAt: true },
    }),
  { models: ['SystemAlert'] },
);

export type OpenSystemAlert = Awaited<ReturnType<typeof getOpenSystemAlerts>>[number];
