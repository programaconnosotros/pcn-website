'use server';

import prisma from '@/lib/prisma';
import { getCurrentSession } from '@/actions/auth/get-current-session';
import { notifyAdmins } from '@/actions/notifications/notify-admins';
import { enforceRateLimit } from '@/lib/rate-limit';
import { fetchYoutubeMetadata } from '@/lib/youtube-metadata';
import {
  RECOMMENDATION_KIND_INFO,
  REVIEW_QUEUE_PATH,
  missingToPublish,
  parseRecommendation,
  recommendationKindSchema,
} from '@/schemas/recommendation-schema';
import {
  DUPLICATE_MESSAGES,
  findDuplicate,
  isUniqueViolation,
  nextPosition,
  uniqueSlug,
  type ActionResult,
} from './recommendation-store';

/**
 * Recomienda un artículo, libro, curso o video. Cualquier miembro con sesión: lo suyo queda
 * pendiente (no se muestra) hasta que un admin lo apruebe, y los admins reciben un aviso. Lo que
 * recomienda un admin se publica directo, si tiene todo lo que la lista muestra.
 */
export async function submitRecommendation(
  kind: unknown,
  input: unknown,
): Promise<ActionResult<{ status: 'PENDING' | 'APPROVED' }>> {
  const session = await getCurrentSession();
  if (!session) return { success: false, error: 'Iniciá sesión para recomendar' };
  const parsedKind = recommendationKindSchema.safeParse(kind);
  if (!parsedKind.success) return { success: false, error: 'Tipo de recomendación inválido' };

  const isAdmin = session.user.role === 'ADMIN';
  // Lanza un RateLimitError: su digest le llega a la UI también en producción.
  if (!isAdmin) await enforceRateLimit('recommendation');

  const recommendationKind = parsedKind.data;
  const parsed = parseRecommendation(recommendationKind, input, { asAdmin: isAdmin });
  if (!parsed.success) return parsed;
  const { youtubeId } = parsed;
  const data = { ...parsed.data };

  const duplicate = await findDuplicate(recommendationKind, data, youtubeId);
  if (duplicate) return { success: false, error: DUPLICATE_MESSAGES[duplicate.status] };

  // A video's channel, length and day come from its YouTube page, when it can be read.
  if (recommendationKind === 'VIDEO' && youtubeId) {
    const metadata = await fetchYoutubeMetadata(youtubeId);
    data.source ||= metadata.channel ?? null;
    data.durationSeconds ||= metadata.durationSeconds ?? null;
    data.publishedAt ||= metadata.publishedAt ?? null;
  }

  if (isAdmin) {
    const missing = missingToPublish(recommendationKind, data);
    if (missing.length) {
      return { success: false, error: `Para publicarlo falta: ${missing.join(', ')}` };
    }
  }

  const slug = youtubeId ?? (await uniqueSlug(recommendationKind, data.title));
  const status = isAdmin ? 'APPROVED' : 'PENDING';
  let created: { id: string };
  try {
    created = await prisma.recommendation.create({
      data: {
        ...data,
        kind: recommendationKind,
        slug,
        status,
        submittedById: session.user.id,
        ...(isAdmin && {
          reviewedById: session.user.id,
          reviewedAt: new Date(),
          position: await nextPosition(recommendationKind),
        }),
      },
      select: { id: true },
    });
  } catch (error) {
    // Two people recommending the same video at once: the second one hits the unique key.
    if (isUniqueViolation(error)) return { success: false, error: DUPLICATE_MESSAGES.PENDING };
    throw error;
  }

  if (!isAdmin) {
    const info = RECOMMENDATION_KIND_INFO[recommendationKind];
    await notifyAdmins({
      type: 'recommendation_pending',
      title: `Nueva recomendación: ${info.article} ${info.label}`,
      message: `${session.user.name} recomendó "${data.title}". Revisala en ${REVIEW_QUEUE_PATH}.`,
      metadata: { recommendationId: created.id, kind: recommendationKind, userId: session.user.id },
    });
  }

  return { success: true, status };
}
