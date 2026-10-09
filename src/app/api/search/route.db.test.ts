import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { GET } from '@/app/api/search/route';
import type { SearchResponse } from '@/lib/search/types';
import { createTestEvent, createUser, uniqueId } from '@/test/db/content-fixtures';

// El buscador global contra Postgres real: encuentra eventos, charlas, consejos y proyectos por
// texto, y nunca muestra eventos eliminados.

const search = async (q: string) => {
  const response = await GET(
    new NextRequest(`https://pcn.test/api/search?q=${encodeURIComponent(q)}`),
  );
  return (await response.json()) as SearchResponse;
};

it('finds live events, talks by speaker, advice and projects', async () => {
  const word = `zorzal${uniqueId()}`;
  const author = await createUser();
  const event = await createTestEvent({ name: `Meetup ${word}` });
  await createTestEvent({ name: `Borrado ${word}`, deletedAt: new Date() });
  await prisma.talk.create({
    data: {
      title: 'Charla sin la palabra',
      description: 'Descripción cualquiera',
      slideImages: [],
      speakers: { create: [{ speakerName: `Orador ${word}`, speakerPhone: '5491100000000' }] },
    },
  });
  const advice = await prisma.advice.create({
    data: { content: `Consejo ${word}`, authorId: author.id },
  });
  await prisma.project.create({
    data: {
      title: `Proyecto ${word}`,
      description: 'Un proyecto',
      url: 'https://proyecto.test',
      logoUrl: '/logo.png',
      techStack: ['TypeScript'],
    },
  });

  const { results } = await search(word);
  const mine = results.filter((r) => r.title.includes(word) || r.subtitle?.includes(word));

  expect(mine.map((r) => [r.type, r.href])).toEqual([
    ['evento', `/eventos/${event.id}`],
    ['consejo', `/consejos/${advice.id}`],
    ['charla', '/charlas'],
    ['proyecto', 'https://proyecto.test'],
  ]);
  expect(JSON.stringify(results)).not.toContain('Borrado');
  expect(JSON.stringify(results)).not.toContain('5491100000000');
});

it('leaves suspended accounts out of the people results', async () => {
  const word = `zorzal${uniqueId()}`;
  const active = await createUser({ name: `Activa ${word}` });
  const suspended = await createUser({ name: `Suspendida ${word}`, suspendedAt: new Date() });

  const hrefs = (await search(word)).results.map((r) => r.href);

  expect(hrefs).toContain(`/perfil/${active.id}`);
  expect(hrefs).not.toContain(`/perfil/${suspended.id}`);
});

it('answers an empty query without searching', async () => {
  await expect(search('   ')).resolves.toEqual({ query: '', results: [] });
});
