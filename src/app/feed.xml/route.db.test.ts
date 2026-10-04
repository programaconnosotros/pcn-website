import prisma from '@/lib/prisma';
import { GET } from '@/app/feed.xml/route';
import { createAdmin, createTestEvent, uniqueId } from '@/test/db/content-fixtures';

// El feed RSS contra Postgres real: anuncios publicados, eventos vivos y charlas.

it('lists published announcements, live events and talks, and nothing else', async () => {
  const word = uniqueId();
  const admin = await createAdmin();
  const event = await createTestEvent({ name: `Evento ${word}` });
  await createTestEvent({ name: `Eliminado ${word}`, deletedAt: new Date() });
  await prisma.announcement.createMany({
    data: [
      {
        title: `Publicado ${word}`,
        content: 'Contenido',
        category: 'evento',
        authorId: admin.id,
        eventId: event.id,
      },
      {
        title: `Borrador ${word}`,
        content: 'Contenido',
        category: 'general',
        authorId: admin.id,
        published: false,
      },
    ],
  });
  await prisma.talk.create({
    data: {
      title: `Charla ${word}`,
      description: 'Descripción',
      slideImages: [],
      speakers: { create: [{ speakerName: 'Ada & Grace', speakerPhone: '5491199999999' }] },
    },
  });

  const response = await GET();
  const xml = await response.text();

  expect(response.headers.get('Content-Type')).toContain('application/rss+xml');
  expect(xml).toContain(`Publicado ${word}`);
  expect(xml).toContain(`/eventos/${event.id}`);
  expect(xml).toContain(`Evento: Evento ${word}`);
  expect(xml).toContain(`Charla: Charla ${word} (Ada &amp; Grace)`);
  expect(xml).not.toContain(`Borrador ${word}`);
  expect(xml).not.toContain(`Eliminado ${word}`);
  expect(xml).not.toContain('5491199999999');
});
