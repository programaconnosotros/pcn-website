import prisma from '@/lib/prisma';
import { getAchievementMetrics, getUserAchievementMetrics } from '@/lib/achievement-metrics';
import { EMPTY_METRICS } from '@/lib/achievements';
import { getCollaborationStats } from '@/lib/github-stats';
import { createTestEvent, createUser, daysFromNow, uniqueId } from '@/test/db/content-fixtures';

// Los conteos detrás de los logros, contra Postgres real: cada uno cuenta lo que debe (eventos ya
// pasados y vivos, inscripciones activas, etc.) y nada más.

// An external talk the data migration loaded (Recommendation, kind VIDEO with isTalk).
const EXTERNAL_TALK = 'HqB3t7046QE';

const createProject = (authorId: string | null, memberIds: string[] = []) =>
  prisma.project.create({
    data: {
      title: `Proyecto ${uniqueId()}`,
      description: 'Un proyecto',
      url: 'https://proyecto.test',
      logoUrl: '/logo.png',
      techStack: [],
      authorId,
      members: { create: memberIds.map((userId) => ({ userId, memberName: 'Miembro' })) },
    },
  });

it('counts attended and organized events only when they already happened and are live', async () => {
  const user = await createUser();
  const past = await createTestEvent({ date: daysFromNow(-10) });
  const pastToo = await createTestEvent({ date: daysFromNow(-20) });
  const future = await createTestEvent({ date: daysFromNow(10) });
  const deleted = await createTestEvent({ date: daysFromNow(-5), deletedAt: new Date() });
  const cancelled = await createTestEvent({ date: daysFromNow(-3) });

  await prisma.eventRegistration.createMany({
    data: [
      { eventId: past.id, userId: user.id },
      { eventId: pastToo.id, userId: user.id },
      { eventId: future.id, userId: user.id },
      { eventId: deleted.id, userId: user.id },
      { eventId: cancelled.id, userId: user.id, cancelledAt: daysFromNow(-4) },
    ],
  });
  await prisma.eventOrganizer.createMany({
    data: [
      { eventId: past.id, userId: user.id },
      { eventId: future.id, userId: user.id },
      { eventId: deleted.id, userId: user.id },
    ],
  });

  expect(await getUserAchievementMetrics(user.id)).toMatchObject({
    eventsAttended: 2,
    eventsOrganized: 1,
  });
});

it('counts talks given, talks watched, articles read, advice and shared projects', async () => {
  const user = await createUser();
  const other = await createUser();
  await prisma.talk.create({
    data: {
      title: 'Charla',
      description: 'Descripción',
      slideImages: [],
      speakers: {
        create: [
          { speakerName: 'Yo', speakerPhone: '1', userId: user.id },
          { speakerName: 'Otra', speakerPhone: '2', userId: other.id },
        ],
      },
    },
  });
  await prisma.contentMark.createMany({
    data: [
      { userId: user.id, contentType: 'video', contentId: EXTERNAL_TALK, mark: 'watched' },
      // Un video que no es una charla externa no cuenta
      { userId: user.id, contentType: 'video', contentId: 'otro-video', mark: 'watched' },
      { userId: user.id, contentType: 'article', contentId: 'a1', mark: 'read' },
      { userId: user.id, contentType: 'article', contentId: 'a2', mark: 'read' },
      { userId: user.id, contentType: 'article', contentId: 'a3', mark: 'saved' },
    ],
  });
  await prisma.advice.createMany({
    data: [
      { content: 'uno', authorId: user.id },
      { content: 'dos', authorId: user.id },
    ],
  });
  // Autor y miembro del mismo proyecto cuenta una vez; miembro de otro, otra
  await createProject(user.id, [user.id]);
  await createProject(other.id, [user.id]);

  const metrics = await getAchievementMetrics([user.id, other.id]);

  expect(metrics.get(user.id)).toMatchObject({
    talksGiven: 1,
    talksWatched: 1,
    articlesRead: 2,
    consejos: 2,
    projectsShared: 2,
  });
  expect(metrics.get(other.id)).toMatchObject({ talksGiven: 1, projectsShared: 1, consejos: 0 });
});

it('ranks linked GitHub accounts like /desarrollo and leaves inactive users out', async () => {
  const contributor = await createUser();
  const idle = await createUser();
  const [top] = (await getCollaborationStats()).topContributors;
  await prisma.identityLink.create({
    data: { source: 'github', externalName: top.login, userId: contributor.id },
  });

  const metrics = await getAchievementMetrics([contributor.id, idle.id]);

  expect(metrics.get(contributor.id)).toMatchObject({ contributorRank: 1, commits: top.commits });
  expect(metrics.has(idle.id)).toBe(false);
  expect(await getUserAchievementMetrics(idle.id)).toEqual(EMPTY_METRICS);
});

it('without user ids, covers everyone with activity', async () => {
  const user = await createUser();
  await prisma.advice.create({ data: { content: 'consejo', authorId: user.id } });

  expect((await getAchievementMetrics()).get(user.id)?.consejos).toBe(1);
});
