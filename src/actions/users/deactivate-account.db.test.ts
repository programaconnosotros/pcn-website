import prisma from '@/lib/prisma';
import { actAs, createUser } from '@/test/db/fixtures';
import { quickUser, sessionCookie, uid } from '@/test/db/actions-fixtures';
import { createTestEvent, daysFromNow } from '@/test/db/content-fixtures';
import { DEACTIVATED_EMAIL_DOMAIN } from '@/lib/active-user';
import { findSession } from '@/lib/session';
import { getForumPost } from '@/lib/forum';
import { fetchCommunityMembers } from '@/actions/users/fetch-community-members';
import { searchCommunityMembers } from '@/actions/users/search-community-members';
import { notifyEveryone } from '@/actions/notifications/notify-users';
import { createForumComment } from '@/actions/forum/engagement';
import { createForumPost } from '@/actions/forum/posts';
import { deactivateAccount } from './deactivate-account';

// Deactivating an account against a real Postgres: everything the person was linked to stays up
// and keeps loading, only the links and their personal data go.

const PASSWORD = 'contraseña-segura';

/** A member tagged, credited and signed up all over the site, plus someone else's content. */
const seedMember = async () => {
  const member = await createUser({ password: PASSWORD, email: `leaving-${uid()}@test.pcn` });
  const other = await quickUser();

  const photo = await prisma.galleryItem.create({
    data: {
      src: `gallery/${uid()}.jpg`,
      thumbSrc: `gallery/${uid()}-thumb.jpg`,
      takenAt: new Date(),
      tags: { create: [{ userId: member.id }, { userId: other.id }] },
    },
  });
  const project = await prisma.project.create({
    data: {
      title: 'Proyecto compartido',
      description: 'Un proyecto con dos miembros',
      url: 'https://example.com',
      logoUrl: 'https://example.com/logo.png',
      authorId: other.id,
      members: {
        create: [
          { userId: member.id, memberName: 'Ana Pérez' },
          { userId: other.id, memberName: 'Otro' },
        ],
      },
    },
  });
  const talk = await prisma.talk.create({
    data: {
      title: 'Una charla',
      description: 'Sobre algo',
      speakers: { create: [{ userId: member.id, speakerName: 'Ana Pérez', speakerPhone: '1' }] },
    },
  });
  const badge = await prisma.badge.create({
    data: { name: `Badge ${uid()}`, description: 'Por algo', icon: 'award', tone: 'green' },
  });
  await prisma.userBadge.create({ data: { userId: member.id, badgeId: badge.id } });
  const advice = await prisma.advice.create({
    data: { authorId: other.id, content: `Un consejo ${uid()}` },
  });
  await prisma.like.create({ data: { userId: member.id, adviceId: advice.id } });

  // A full upcoming event: when the member leaves, the first one waiting gets the spot.
  const upcoming = await createTestEvent({ capacity: 1 });
  await prisma.eventRegistration.create({ data: { eventId: upcoming.id, userId: member.id } });
  const waiting = await quickUser();
  await prisma.eventWaitlistEntry.create({ data: { eventId: upcoming.id, userId: waiting.id } });
  const past = await createTestEvent({ date: daysFromNow(-30) });
  await prisma.eventRegistration.create({ data: { eventId: past.id, userId: member.id } });

  // Their own thread, answered by someone else.
  await actAs(member.id);
  const thread = await createForumPost({
    title: 'Mi tema',
    categoryId: 'forum-cat-general',
    content: 'Un tema con suficiente contenido para pasar la validación.',
  });
  await actAs(other.id);
  await createForumComment(thread.id, { content: 'Te respondo', parentCommentId: null });

  return { member, other, waiting, photo, project, talk, upcoming, past, thread };
};

it('asks for the password and the confirmation phrase', async () => {
  const member = await createUser({ password: PASSWORD });
  await actAs(member.id);

  await expect(deactivateAccount({ password: PASSWORD, confirmation: 'chau' })).resolves.toEqual({
    success: false,
    error: expect.stringMatching(/desactivar/),
  });
  await expect(
    deactivateAccount({ password: 'otra-cosa', confirmation: 'desactivar' }),
  ).resolves.toEqual({ success: false, error: 'La contraseña no es correcta.' });
  expect((await prisma.user.findUniqueOrThrow({ where: { id: member.id } })).deactivatedAt).toBe(
    null,
  );
});

it('refuses admins and anonymous visitors', async () => {
  const admin = await createUser({ role: 'ADMIN', password: PASSWORD });
  await actAs(admin.id);
  await expect(
    deactivateAccount({ password: PASSWORD, confirmation: 'desactivar' }),
  ).resolves.toMatchObject({ success: false, error: expect.stringMatching(/admin/) });

  await actAs();
  await expect(
    deactivateAccount({ password: PASSWORD, confirmation: 'desactivar' }),
  ).rejects.toThrow('Debes estar autenticado');
});

it('anonymizes the account, logs it out and only drops its links', async () => {
  const seed = await seedMember();
  const { member, other, waiting } = seed;

  await actAs(member.id);
  const token = await sessionCookie();
  await expect(
    deactivateAccount({ password: PASSWORD, confirmation: ' Desactivar ' }),
  ).resolves.toEqual({ success: true });

  // The row stays, anonymized, and the email is free for a new account.
  const user = await prisma.user.findUniqueOrThrow({ where: { id: member.id } });
  expect(user.deactivatedAt).toEqual(expect.any(Date));
  expect(user.name).toMatch(/cuenta desactivada/i);
  expect(user.email).toBe(`${member.id}@${DEACTIVATED_EMAIL_DOMAIN}`);
  expect(user.image).toBeNull();
  expect(await prisma.user.findUnique({ where: { email: member.email } })).toBeNull();
  await expect(createUser({ email: member.email })).resolves.toBeTruthy();

  // Logged out everywhere.
  expect(await prisma.session.count({ where: { userId: member.id } })).toBe(0);
  expect(await findSession(token!)).toBeNull();

  // What they were tagged in stays, with everyone else still in it.
  const photo = await prisma.galleryItem.findUniqueOrThrow({
    where: { id: seed.photo.id },
    include: { tags: true },
  });
  expect(photo.tags.map((tag) => tag.userId)).toEqual([other.id]);
  const members = await prisma.projectMember.findMany({
    where: { projectId: seed.project.id },
    orderBy: { memberName: 'asc' },
  });
  expect(members.map(({ memberName, userId }) => [memberName, userId])).toEqual([
    ['Ana Pérez', null],
    ['Otro', other.id],
  ]);
  expect(await prisma.talkSpeaker.findFirst({ where: { talkId: seed.talk.id } })).toMatchObject({
    userId: null,
    speakerName: 'Ana Pérez',
  });
  expect(await prisma.userBadge.count({ where: { userId: member.id } })).toBe(0);
  expect(await prisma.like.count({ where: { userId: member.id } })).toBe(0);

  // Their spot in the upcoming event went to whoever was waiting; the past one is history.
  const registrations = await prisma.eventRegistration.findMany({
    where: { eventId: seed.upcoming.id, cancelledAt: null },
  });
  expect(registrations.map((r) => r.userId)).toEqual([waiting.id]);
  expect(
    await prisma.eventRegistration.findFirst({
      where: { eventId: seed.past.id, userId: member.id },
    }),
  ).toMatchObject({ cancelledAt: null });

  // Their thread still loads, with its replies, signed by the deactivated account.
  const thread = await getForumPost(seed.thread.id);
  expect(thread?.author.name).toMatch(/cuenta desactivada/i);
  expect(thread?.comments.map((c) => c.content)).toEqual(['Te respondo']);

  // And they're gone from every list of members.
  expect((await fetchCommunityMembers()).map((u) => u.id)).not.toContain(member.id);
  await actAs(other.id);
  expect((await searchCommunityMembers('desactivada')).map((u) => u.id)).not.toContain(member.id);
  await notifyEveryone({ type: 'test', title: 'Hola', message: 'A todos', href: '/' });
  expect(await prisma.notification.count({ where: { userId: member.id } })).toBe(0);
  expect(await prisma.notification.count({ where: { userId: other.id, type: 'test' } })).toBe(1);
});
