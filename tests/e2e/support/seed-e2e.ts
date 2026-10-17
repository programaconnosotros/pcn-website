// Datos fijos de la suite e2e, encima del seed general (prisma/seed.ts). Lo corre prepare.ts con
// DATABASE_URL apuntando a la base e2e.
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '../../../src/generated/prisma/client';
import { pgAdapter } from '../../../src/lib/database-url';
import { ADVICE, ANNOUNCEMENTS, EVENTS, PASSWORD, PROJECT, TESTIMONIAL, USERS } from './data';

const prisma = new PrismaClient({ adapter: pgAdapter(process.env.DATABASE_URL) });
const DAY = 86_400_000;

const main = async () => {
  // Costo bajo: el login compara igual y el seed no tarda segundos por usuario
  const password = await bcrypt.hash(PASSWORD, 4);

  const users = Object.fromEntries(
    await Promise.all(
      Object.entries(USERS).map(async ([role, user]) => [
        role,
        await prisma.user.upsert({
          where: { email: user.email },
          update: {},
          create: {
            email: user.email,
            name: user.name,
            password,
            emailVerified: role !== 'unverified',
            role: role === 'admin' ? 'ADMIN' : 'REGULAR',
            countryOfOrigin: 'Argentina',
            slogan: `Slogan de ${user.name}`,
          },
        }),
      ]),
    ),
  ) as Record<keyof typeof USERS, { id: string }>;

  const now = Date.now();
  const event = (
    key: keyof typeof EVENTS,
    data: { daysFromNow: number; capacity?: number; isOnline?: boolean; callForSpeakers?: boolean },
  ) =>
    prisma.event.create({
      data: {
        id: EVENTS[key].id,
        name: EVENTS[key].name,
        description: `Descripción de ${EVENTS[key].name}.`,
        date: new Date(now + data.daysFromNow * DAY),
        capacity: data.capacity ?? null,
        isOnline: data.isOnline ?? false,
        city: data.isOnline ? null : 'Córdoba',
        placeName: data.isOnline ? null : 'Cowork E2E',
        address: data.isOnline ? null : 'Calle Falsa 123',
        streamingUrl: data.isOnline ? 'https://www.youtube.com/watch?v=e2e' : null,
        callForSpeakersEnabled: data.callForSpeakers ?? false,
        createdById: users.admin.id,
      },
    });

  await event('upcoming', { daysFromNow: 14, capacity: 2, callForSpeakers: true });
  await event('online', { daysFromNow: 21, isOnline: true });
  await event('past', { daysFromNow: -30 });
  await event('full', { daysFromNow: 10, capacity: 1 });

  await prisma.eventOrganizer.create({
    data: { eventId: EVENTS.upcoming.id, userId: users.organizer.id },
  });
  await prisma.eventRegistration.create({
    data: { eventId: EVENTS.full.id, userId: users.organizer.id },
  });

  await prisma.talk.create({
    data: {
      eventId: EVENTS.past.id,
      title: 'Charla E2E sobre Playwright',
      description: 'Cómo testear de punta a punta.',
      speakers: {
        create: [
          {
            speakerName: USERS.member.name,
            speakerPhone: '+5493510000000',
            userId: users.member.id,
          },
        ],
      },
    },
  });

  await prisma.advice.create({
    data: { id: ADVICE.id, content: ADVICE.content, authorId: users.member.id },
  });

  await prisma.project.create({
    data: {
      id: PROJECT.id,
      title: PROJECT.title,
      description: 'Un proyecto creado por la suite e2e.',
      url: 'https://example.com/proyecto-e2e',
      logoUrl: '',
      isOpenSource: true,
      repoUrl: 'https://github.com/example/proyecto-e2e',
      authorId: users.member.id,
      techStack: ['TypeScript', 'Playwright'],
    },
  });

  await prisma.announcement.createMany({
    data: [
      {
        id: ANNOUNCEMENTS.published.id,
        title: ANNOUNCEMENTS.published.title,
        content: 'Contenido del anuncio publicado.',
        category: 'general',
        published: true,
        authorId: users.admin.id,
      },
      {
        id: ANNOUNCEMENTS.draft.id,
        title: ANNOUNCEMENTS.draft.title,
        content: 'Contenido del borrador.',
        category: 'general',
        published: false,
        authorId: users.admin.id,
      },
    ],
  });

  await prisma.testimonial.create({
    data: { id: TESTIMONIAL.id, body: TESTIMONIAL.body, userId: users.member.id, featured: true },
  });
};

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
