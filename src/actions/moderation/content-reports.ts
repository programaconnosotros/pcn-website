'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getCurrentSession } from '@/actions/auth/get-current-session';
import { notifyAdmins } from '@/actions/notifications/notify-admins';
import { requireAdmin } from '@/lib/admin';
import {
  REPORT_REASONS,
  REPORTABLE_LABELS,
  findReportedContent,
  isReportableType,
} from '@/lib/content-reports';
import prisma from '@/lib/prisma';
import { enforceRateLimit } from '@/lib/rate-limit';

const reportSchema = z.object({
  contentType: z.string().refine(isReportableType, 'No se puede reportar eso'),
  contentId: z.string().min(1).max(64),
  reason: z.enum(Object.keys(REPORT_REASONS) as [keyof typeof REPORT_REASONS]),
  details: z.string().trim().max(500, 'Máximo 500 caracteres').optional(),
});

type Result = { success: true } | { success: false; error: string };

/** A member reports something for the admins to review. Once per person and piece of content. */
export async function reportContent(input: z.input<typeof reportSchema>): Promise<Result> {
  const session = await getCurrentSession();
  if (!session) throw new Error('Debes estar autenticado');
  await enforceRateLimit('comment');

  const parsed = reportSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Datos inválidos' };
  }
  const { contentId, reason } = parsed.data;
  const contentType = parsed.data.contentType as keyof typeof REPORTABLE_LABELS;
  const details = parsed.data.details || null;

  const content = await findReportedContent(contentType, contentId);
  if (!content) return { success: false, error: 'Eso ya no existe.' };
  if (content.ownerId === session.user.id) {
    return { success: false, error: 'No podés reportar algo tuyo.' };
  }

  const where = {
    reporterId_contentType_contentId: { reporterId: session.user.id, contentType, contentId },
  };
  const existing = await prisma.contentReport.findUnique({ where, select: { status: true } });
  if (existing?.status === 'PENDING') {
    return { success: false, error: 'Ya lo reportaste: un admin lo va a revisar.' };
  }
  // A report an admin already closed can be filed again if it happens again.
  await prisma.contentReport.upsert({
    where,
    create: { reporterId: session.user.id, contentType, contentId, reason, details },
    update: { reason, details, status: 'PENDING', resolvedById: null, resolvedAt: null },
  });

  await notifyAdmins({
    type: 'content_reported',
    title: 'Nuevo reporte',
    message: `Reportaron un ${REPORTABLE_LABELS[contentType]} por "${REPORT_REASONS[reason]}": "${content.preview}".`,
    metadata: { href: '/admin/moderacion', contentType, contentId },
  });
  revalidatePath('/admin/moderacion');
  return { success: true };
}

const reviewSchema = z.object({
  contentType: z.string().refine(isReportableType),
  contentId: z.string().min(1).max(64),
  status: z.enum(['RESOLVED', 'DISMISSED']),
});

/**
 * Closes every pending report of one piece of content: RESOLVED when an admin acted on it (edited
 * or deleted it on its page), DISMISSED when there was nothing to do. Admins only.
 */
export async function reviewReports(input: z.input<typeof reviewSchema>) {
  const admin = await requireAdmin();
  const { contentType, contentId, status } = reviewSchema.parse(input);
  const { count } = await prisma.contentReport.updateMany({
    where: { contentType, contentId, status: 'PENDING' },
    data: { status, resolvedById: admin.id, resolvedAt: new Date() },
  });
  revalidatePath('/admin/moderacion');
  return { success: true, count };
}
