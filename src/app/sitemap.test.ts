import { prismaMock } from '@/test/prisma';
import { extractedConsejos } from '@/data/consejos-extraidos';
import { communityCourses, externalCourses } from './(platform)/cursos/courses';
import { TRACKS } from './(platform)/entrevistas/questions/types';
import sitemap from './sitemap';

const SITE = 'https://programaconnosotros.com';
const updatedAt = new Date('2025-05-01T00:00:00Z');

const mockRecords = () => {
  prismaMock.event.findMany.mockResolvedValue([{ id: 'e1', updatedAt }] as any);
  prismaMock.advice.findMany.mockResolvedValue([{ id: 'a1', updatedAt }] as any);
  prismaMock.testimonial.findMany.mockResolvedValue([{ id: 't1', updatedAt }] as any);
  prismaMock.setup.findMany.mockResolvedValue([{ id: 's1', updatedAt }] as any);
};

describe('sitemap', () => {
  it('lists the static pages, with the home page first and highest priority', async () => {
    mockRecords();
    const entries = await sitemap();

    expect(entries[0]).toEqual({ url: SITE, changeFrequency: 'weekly', priority: 1 });
    expect(entries).toContainEqual({
      url: `${SITE}/eventos`,
      changeFrequency: 'weekly',
      priority: 0.7,
    });
  });

  it('lists every course and interview guide', async () => {
    mockRecords();
    const urls = (await sitemap()).map((entry) => entry.url);

    for (const course of [...communityCourses, ...externalCourses])
      expect(urls).toContain(`${SITE}/cursos/${course.id}`);
    for (const track of TRACKS) expect(urls).toContain(`${SITE}/entrevistas/guias/${track.id}`);
    expect(urls).toContain(`${SITE}/entrevistas/guias/live-coding`);
  });

  it('lists the records in the database with their last change, and the extracted consejos', async () => {
    mockRecords();
    const entries = await sitemap();

    for (const path of ['/eventos/e1', '/consejos/a1', '/testimonios/t1', '/setups/s1'])
      expect(entries).toContainEqual({ url: `${SITE}${path}`, lastModified: updatedAt });
    const extracted = extractedConsejos[0];
    expect(entries).toContainEqual({
      url: `${SITE}/consejos/${extracted.id}`,
      lastModified: new Date(extracted.conversation.date),
    });
    expect(prismaMock.event.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { deletedAt: null } }),
    );
  });

  it('still serves the static part when the database is down', async () => {
    prismaMock.event.findMany.mockRejectedValue(new Error('db down'));
    prismaMock.advice.findMany.mockResolvedValue([]);
    prismaMock.testimonial.findMany.mockResolvedValue([]);
    prismaMock.setup.findMany.mockResolvedValue([]);

    const urls = (await sitemap()).map((entry) => entry.url);

    expect(urls).toContain(`${SITE}/eventos`);
    expect(urls.some((url) => url.includes('/consejos/auto-'))).toBe(false);
    expect(console.error).toHaveBeenCalledWith(
      'sitemap: failed to load dynamic routes',
      expect.any(Error),
    );
  });
});
