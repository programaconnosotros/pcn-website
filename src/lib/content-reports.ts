import prisma from '@/lib/prisma';
import { excerpt } from '@/actions/notifications/excerpt';
import { isReportableType, type ReportableType } from '@/lib/content-report-types';

export * from '@/lib/content-report-types';

// What members can report and how to find each kind: who wrote it (nobody reports themselves), a
// line to show in the moderation queue and the page where an admin acts on it. Server-only.

export type ReportedContent = {
  /** Who it belongs to; null when nobody on the site does (a legacy photo). */
  ownerId: string | null;
  preview: string;
  href: string;
};

type Finder = (_id: string) => Promise<ReportedContent | null>;

const FINDERS: Record<ReportableType, Finder> = {
  forum_post: async (id) => {
    const post = await prisma.forumPost.findUnique({
      where: { id },
      select: { authorId: true, title: true },
    });
    return post && { ownerId: post.authorId, preview: post.title, href: `/foro/tema/${id}` };
  },
  forum_comment: async (id) => {
    const comment = await prisma.forumComment.findUnique({
      where: { id },
      select: { authorId: true, content: true, postId: true },
    });
    return (
      comment && {
        ownerId: comment.authorId,
        preview: excerpt(comment.content, 120),
        href: `/foro/tema/${comment.postId}#comentario-${id}`,
      }
    );
  },
  advice: async (id) => {
    const advice = await prisma.advice.findUnique({
      where: { id },
      select: { authorId: true, content: true },
    });
    return (
      advice && {
        ownerId: advice.authorId,
        preview: excerpt(advice.content, 120),
        href: `/consejos/${id}`,
      }
    );
  },
  advice_comment: async (id) => {
    const comment = await prisma.comment.findUnique({
      where: { id },
      select: { authorId: true, content: true, adviceId: true, extractedId: true },
    });
    return (
      comment && {
        ownerId: comment.authorId,
        preview: excerpt(comment.content, 120),
        href: `/consejos/${comment.adviceId ?? comment.extractedId}`,
      }
    );
  },
  setup: async (id) => {
    const setup = await prisma.setup.findUnique({
      where: { id },
      select: { authorId: true, title: true },
    });
    return setup && { ownerId: setup.authorId, preview: setup.title, href: `/setups/${id}` };
  },
  gallery_item: async (id) => {
    const item = await prisma.galleryItem.findUnique({
      where: { id },
      select: { uploadedById: true, description: true },
    });
    return (
      item && {
        ownerId: item.uploadedById,
        preview: excerpt(item.description ?? 'Foto sin descripción', 120),
        href: `/galeria/${id}`,
      }
    );
  },
  project: async (id) => {
    const project = await prisma.project.findUnique({
      where: { id },
      select: { authorId: true, title: true },
    });
    return (
      project && { ownerId: project.authorId, preview: project.title, href: `/proyectos/${id}` }
    );
  },
  user: async (id) => {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, deactivatedAt: true },
    });
    return user && !user.deactivatedAt
      ? { ownerId: user.id, preview: user.name, href: `/perfil/${id}` }
      : null;
  },
};

/** The reported thing, or null when it no longer exists. */
export const findReportedContent = (type: ReportableType, id: string) => FINDERS[type](id);

export type ReportGroup = {
  contentType: ReportableType;
  contentId: string;
  /** Null when the content was deleted after it was reported. */
  content: ReportedContent | null;
  reports: {
    id: string;
    reason: string;
    details: string | null;
    createdAt: Date;
    reporter: { id: string; name: string } | null;
  }[];
};

/** Pending reports, one group per reported thing, the most reported first. */
export const listPendingReports = async (): Promise<ReportGroup[]> => {
  const reports = await prisma.contentReport.findMany({
    where: { status: 'PENDING' },
    orderBy: { createdAt: 'asc' },
    take: 500,
    select: {
      id: true,
      contentType: true,
      contentId: true,
      reason: true,
      details: true,
      createdAt: true,
      reporter: { select: { id: true, name: true } },
    },
  });

  const groups = new Map<string, Omit<ReportGroup, 'content'>>();
  for (const { contentType, contentId, ...report } of reports) {
    if (!isReportableType(contentType)) continue;
    const key = `${contentType}:${contentId}`;
    const group = groups.get(key) ?? { contentType, contentId, reports: [] };
    group.reports.push(report);
    groups.set(key, group);
  }

  const withContent = await Promise.all(
    [...groups.values()].map(async (group) => ({
      ...group,
      content: await findReportedContent(group.contentType, group.contentId),
    })),
  );
  return withContent.sort((a, b) => b.reports.length - a.reports.length);
};

/** How much is waiting in each review queue of the site, for /admin/moderacion. */
export const countModerationQueues = async () => {
  const [reports, photos, recommendations, proposals] = await Promise.all([
    prisma.contentReport.count({ where: { status: 'PENDING' } }),
    prisma.galleryItem.count({ where: { status: 'PENDING' } }),
    prisma.recommendation.count({ where: { status: 'PENDING' } }),
    prisma.talkProposal.count({ where: { status: 'PENDING' } }),
  ]);
  return { reports, photos, recommendations, proposals };
};
