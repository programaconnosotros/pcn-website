import { NextRequest } from 'next/server';
import { prismaMock } from '@/test/prisma';
import { getStaticIndex, toEntry } from '@/lib/search/search-index';
import type { SearchResponse } from '@/lib/search/types';
import { GET } from './route';

jest.mock('@/lib/search/search-index', () => ({
  ...jest.requireActual('@/lib/search/search-index'),
  getStaticIndex: jest.fn(),
}));

const mockStaticIndex = getStaticIndex as jest.Mock;

const search = async (q?: string) => {
  const url = new URL('http://localhost/api/search');
  if (q !== undefined) url.searchParams.set('q', q);
  const response = await GET(new NextRequest(url));
  return { response, body: (await response.json()) as SearchResponse };
};

const mockCorpus = () => {
  prismaMock.event.findMany.mockResolvedValue([
    {
      id: 'e1',
      name: 'Meetup de React',
      description: 'Hablamos de hooks',
      date: new Date('2025-05-10T22:00:00Z'),
      placeName: 'Cowork',
      city: 'Tucumán',
      isOnline: false,
    },
    {
      id: 'e2',
      name: 'Café online de React',
      description: '',
      date: new Date('2025-06-10T22:00:00Z'),
      placeName: null,
      city: null,
      isOnline: true,
    },
    {
      id: 'e3',
      name: 'Otro evento',
      description: null,
      date: new Date('2025-06-10T22:00:00Z'),
      placeName: null,
      city: 'Salta',
      isOnline: false,
    },
  ] as any);
  prismaMock.talk.findMany.mockResolvedValue([
    {
      title: 'Testing en React',
      description: 'Jest',
      speakers: [{ speakerName: 'Ana' }, { speakerName: 'Beto' }],
    },
    { title: 'React sin oradores', description: 'x', speakers: [] },
  ] as any);
  prismaMock.advise.findMany.mockResolvedValue([
    { id: 'a1', content: `Aprendé React ${'x'.repeat(100)}`, author: { name: 'Caro' } },
    { id: 'a2', content: 'Usá React con TypeScript', author: { name: 'Dani' } },
  ] as any);
  prismaMock.project.findMany.mockResolvedValue([
    {
      title: 'App en React',
      description: 'Una app',
      techStack: ['React', 'Next', 'Prisma', 'TS'],
      url: 'https://app.dev',
    },
    { title: 'Landing React', description: 'Sitio', techStack: [], url: 'https://landing.dev' },
  ] as any);
};

describe('GET /api/search', () => {
  beforeEach(() => {
    mockStaticIndex.mockReturnValue([
      toEntry({ type: 'seccion', title: 'React docs', href: '/react' }),
      toEntry({ type: 'curso', title: 'Curso de React', href: '/cursos/react' }),
    ]);
  });

  it('returns nothing for an empty query without touching the database', async () => {
    const { body } = await search('   ');
    expect(body).toEqual({ query: '', results: [] });
    expect(prismaMock.event.findMany).not.toHaveBeenCalled();
  });

  it('treats a missing query as empty', async () => {
    expect((await search()).body).toEqual({ query: '', results: [] });
  });

  it('merges static and database matches, grouped in display order, cacheably', async () => {
    mockCorpus();
    const { response, body } = await search('react');

    expect(body.query).toBe('react');
    expect(body.results.map((result) => result.type)).toEqual([
      'seccion',
      'evento',
      'evento',
      'curso',
      'charla',
      'charla',
      'consejo',
      'consejo',
      'proyecto',
      'proyecto',
    ]);
    expect(response.headers.get('Cache-Control')).toBe(
      'public, s-maxage=60, stale-while-revalidate=300',
    );
  });

  it('describes each database result', async () => {
    mockCorpus();
    const { body } = await search('react');
    const byHref = Object.fromEntries(body.results.map((result) => [result.href, result]));

    expect(byHref['/eventos/e1'].subtitle).toMatch(/· Cowork$/);
    expect(byHref['/eventos/e2'].subtitle).toMatch(/· online$/);
    expect(byHref['/consejos/a1'].title).toHaveLength(90);
    expect(byHref['/consejos/a1'].title.endsWith('…')).toBe(true);
    expect(byHref['/consejos/a2']).toMatchObject({
      title: 'Usá React con TypeScript',
      subtitle: 'Dani',
    });
    expect(byHref['https://app.dev'].subtitle).toBe('React · Next · Prisma');
    expect(byHref['https://landing.dev'].subtitle).toBeUndefined();
    const talks = body.results.filter((result) => result.type === 'charla');
    expect(talks.map((talk) => talk.subtitle)).toEqual([undefined, 'Ana, Beto']);
  });

  it('finds talks by speaker and drops records that do not match', async () => {
    mockCorpus();
    const { body } = await search('beto');
    expect(body.results.map((result) => result.title)).toEqual(['Testing en React']);
  });

  it('caps the query at 100 characters', async () => {
    mockCorpus();
    const { body } = await search('a'.repeat(150));
    expect(body.query).toHaveLength(100);
  });

  it('still searches static content when the database is down', async () => {
    prismaMock.event.findMany.mockRejectedValue(new Error('db down'));
    const { response, body } = await search('react');

    expect(response.status).toBe(200);
    expect(body.results.map((result) => result.type)).toEqual(['seccion', 'curso']);
    expect(console.error).toHaveBeenCalledWith('search: database lookup failed', expect.any(Error));
  });
});
