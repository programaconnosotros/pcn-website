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
  prismaMock.advice.findMany.mockResolvedValue([
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
  prismaMock.user.findMany.mockResolvedValue([
    {
      id: 'u1',
      name: 'Ana React',
      jobTitle: 'Frontend',
      enterprise: 'Acme',
      slogan: null,
      career: null,
      studyPlace: null,
    },
    {
      id: 'u2',
      name: 'Beto',
      jobTitle: null,
      enterprise: null,
      slogan: 'Fan de React',
      career: null,
      studyPlace: null,
    },
  ] as any);
  prismaMock.setup.findMany.mockResolvedValue([
    { id: 's1', title: 'Escritorio', description: 'Codeo React acá', author: { name: 'Caro' } },
  ] as any);
  prismaMock.galleryItem.findMany.mockResolvedValue([
    {
      id: 'g1',
      description: 'Charla de React',
      takenAt: new Date('2025-05-10T22:00:00Z'),
      event: { name: 'Meetup' },
      tags: [{ user: { name: 'Dani' } }],
    },
  ] as any);
  prismaMock.testimonial.findMany.mockResolvedValue([
    { id: 't1', body: 'Aprendí React en PCN', user: { name: 'Eli' } },
  ] as any);
  prismaMock.forumPost.findMany.mockResolvedValue([
    {
      id: 'f1',
      title: '¿Server components en React?',
      content: 'Dudas',
      author: { name: 'Fede' },
      category: { slug: 'ayuda' },
    },
    {
      id: 'f2',
      title: 'Otro tema',
      content: 'nada que ver',
      author: { name: 'Gabi' },
      category: { slug: 'general' },
    },
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
      'perfil',
      'perfil',
      'evento',
      'evento',
      'consejo',
      'consejo',
      'foro',
      'charla',
      'charla',
      'curso',
      'setup',
      'foto',
      'testimonio',
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
    expect(byHref['/perfil/u1'].subtitle).toBe('Frontend en Acme');
    expect(byHref['/perfil/u2'].subtitle).toBe('Fan de React');
    expect(byHref['/setups/s1']).toMatchObject({ title: 'Escritorio', subtitle: 'Caro' });
    expect(byHref['/galeria/g1'].subtitle).toMatch(/^Meetup · /);
    expect(byHref['/testimonios/t1']).toMatchObject({ subtitle: 'Eli' });
    expect(byHref['/foro/tema/f1']).toMatchObject({ subtitle: '#ayuda · Fede' });
    expect(byHref['/foro/tema/f2']).toBeUndefined();
  });

  it('finds photos by the people tagged in them', async () => {
    mockCorpus();
    const { body } = await search('dani');
    expect(body.results.filter((r) => r.type === 'foto').map((r) => r.href)).toEqual([
      '/galeria/g1',
    ]);
  });

  it('finds talks by speaker and drops records that do not match', async () => {
    mockCorpus();
    const { body } = await search('beto');
    expect(body.results.map((result) => result.title)).toEqual(['Beto', 'Testing en React']);
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
