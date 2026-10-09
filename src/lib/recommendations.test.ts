import { prismaMock } from '@/test/prisma';
import {
  getAllCourses,
  getArticles,
  getBooks,
  getCourseById,
  getCourses,
  getExternalTalks,
  getOtherVideos,
  getVideos,
  listRecommendationsForReview,
  publicRecommendationSelect,
  type RecommendationRow,
} from './recommendations';

let order = 0;
const row = (values: Partial<RecommendationRow>): RecommendationRow => ({
  id: `r${order}`,
  kind: 'VIDEO',
  slug: `slug-${order}`,
  title: 'Título',
  description: '',
  url: null,
  author: null,
  coauthors: [],
  source: null,
  categories: [],
  language: 'es',
  publishedAt: null,
  year: null,
  imageUrl: null,
  isbn: null,
  durationSeconds: null,
  hours: null,
  youtubeUrls: [],
  isTalk: false,
  isMadeByCommunity: false,
  acceptDonations: false,
  position: order++,
  createdAt: new Date('2026-01-01'),
  ...values,
});

const day = (iso: string) => new Date(`${iso}T00:00:00.000Z`);

const rows = [
  row({
    kind: 'VIDEO',
    slug: 'old-talk-01',
    title: 'Charla vieja',
    author: 'Ana (Acme)',
    source: 'JSConf',
    language: 'en',
    publishedAt: day('2024-05-01'),
    durationSeconds: 1800,
    isTalk: true,
  }),
  row({
    kind: 'VIDEO',
    slug: 'new-video-1',
    title: 'Video nuevo',
    source: 'BettaTech',
    publishedAt: day('2026-04-29'),
    durationSeconds: 600,
  }),
  // Same day as the one before: keeps the list's order.
  row({
    kind: 'VIDEO',
    slug: 'new-talk-01',
    title: 'Charla nueva',
    source: 'Manfred',
    publishedAt: day('2026-04-29'),
    durationSeconds: 2071,
    isTalk: true,
  }),
  row({
    kind: 'ARTICLE',
    slug: '1',
    title: 'Viejo',
    author: 'Addy Osmani',
    coauthors: ['Ana'],
    source: 'addyosmani.com',
    categories: ['IA'],
    description: 'Sobre agentes',
    url: 'https://addyosmani.com/a',
    imageUrl: 'https://github.com/addyosmani.png',
    language: 'en',
    publishedAt: day('2025-01-01'),
  }),
  row({
    kind: 'ARTICLE',
    slug: '2',
    title: 'Nuevo',
    author: 'Santiago M.',
    source: 'x.com',
    categories: ['Arquitectura'],
    description: 'Harness',
    url: 'https://x.com/a',
    imageUrl: '/lectura/santiago.webp',
    publishedAt: day('2026-09-12'),
  }),
  row({
    kind: 'BOOK',
    slug: '7',
    title: 'Refactoring',
    author: 'Martin Fowler',
    categories: ['Programación'],
    description: 'Mejorar el código',
    language: 'en',
    year: 1999,
    imageUrl: '/lectura/refactoring.jpg',
    isbn: '0134757599',
  }),
  row({
    kind: 'BOOK',
    slug: 'clean-code',
    title: 'Clean Code',
    author: 'Robert C. Martin',
    categories: ['Programación'],
    description: 'Código limpio',
    url: 'https://amazon.com/clean',
  }),
  row({
    kind: 'COURSE',
    slug: 'git-and-github',
    title: 'Git & GitHub',
    author: 'Agustín Sánchez',
    description: 'Control de versiones',
    imageUrl: '/software-logos/github.webp',
    youtubeUrls: ['https://www.youtube.com/embed/WlB2fzl1vO8'],
    isMadeByCommunity: true,
    publishedAt: day('2020-06-27'),
    hours: 2,
  }),
  row({
    kind: 'COURSE',
    slug: 'nextjs',
    title: 'Next.js',
    author: 'Vercel',
    description: 'El curso oficial',
    url: 'https://nextjs.org/learn',
    publishedAt: day('2026-01-01'),
  }),
];

beforeEach(() => {
  prismaMock.recommendation.findMany.mockResolvedValue(rows as never);
});

describe('the public listings', () => {
  it('reads only the approved rows, without the note or who sent them', async () => {
    await getVideos();
    expect(prismaMock.recommendation.findMany).toHaveBeenCalledWith({
      where: { status: 'APPROVED' },
      orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
      select: publicRecommendationSelect,
    });
    expect(publicRecommendationSelect).not.toHaveProperty('note');
    expect(publicRecommendationSelect).not.toHaveProperty('submittedById');
  });

  it('lists the videos newest first, keeping the order of same-day ones', async () => {
    expect(await getVideos()).toEqual([
      {
        id: 'new-video-1',
        title: 'Video nuevo',
        channel: 'BettaTech',
        date: '2026-04-29',
        durationSeconds: 600,
        language: 'es',
      },
      {
        id: 'new-talk-01',
        title: 'Charla nueva',
        channel: 'Manfred',
        date: '2026-04-29',
        durationSeconds: 2071,
        language: 'es',
        isTalk: true,
      },
      {
        id: 'old-talk-01',
        title: 'Charla vieja',
        speaker: 'Ana (Acme)',
        channel: 'JSConf',
        date: '2024-05-01',
        durationSeconds: 1800,
        language: 'en',
        isTalk: true,
      },
    ]);
  });

  it('splits the videos into external talks and the rest', async () => {
    expect((await getExternalTalks()).map((video) => video.id)).toEqual([
      'new-talk-01',
      'old-talk-01',
    ]);
    expect((await getOtherVideos()).map((video) => video.id)).toEqual(['new-video-1']);
  });

  it('lists the articles newest first, in the shape /lectura uses', async () => {
    expect(await getArticles()).toEqual([
      {
        id: '2',
        title: 'Nuevo',
        author: 'Santiago M.',
        source: 'x.com',
        category: 'Arquitectura',
        description: 'Harness',
        url: 'https://x.com/a',
        avatar: '/lectura/santiago.webp',
        date: '2026-09-12',
        language: 'es',
      },
      {
        id: '1',
        title: 'Viejo',
        author: 'Addy Osmani',
        coauthors: ['Ana'],
        source: 'addyosmani.com',
        category: 'IA',
        description: 'Sobre agentes',
        url: 'https://addyosmani.com/a',
        avatar: 'https://github.com/addyosmani.png',
        date: '2025-01-01',
        language: 'en',
      },
    ]);
  });

  it('lists the books by title, leaving out what they lack', async () => {
    expect(await getBooks()).toEqual([
      {
        id: 'clean-code',
        title: 'Clean Code',
        author: 'Robert C. Martin',
        language: 'es',
        categories: ['Programación'],
        description: 'Código limpio',
        url: 'https://amazon.com/clean',
      },
      {
        id: '7',
        title: 'Refactoring',
        author: 'Martin Fowler',
        language: 'en',
        categories: ['Programación'],
        description: 'Mejorar el código',
        year: 1999,
        cover: '/lectura/refactoring.jpg',
        isbn: '0134757599',
      },
    ]);
  });

  it('splits the courses into community-made and recommended ones', async () => {
    const { communityCourses, externalCourses } = await getCourses();
    expect(communityCourses).toEqual([
      {
        id: 'git-and-github',
        name: 'Git & GitHub',
        description: 'Control de versiones',
        logo: '/software-logos/github.webp',
        youtubeUrls: ['https://www.youtube.com/embed/WlB2fzl1vO8'],
        teachedBy: 'Agustín Sánchez',
        acceptDonations: false,
        isMadeByCommunity: true,
        date: day('2020-06-27'),
        hours: 2,
      },
    ]);
    expect(externalCourses).toEqual([
      {
        id: 'nextjs',
        name: 'Next.js',
        description: 'El curso oficial',
        websiteUrl: 'https://nextjs.org/learn',
        teachedBy: 'Vercel',
        acceptDonations: false,
        isMadeByCommunity: false,
        date: day('2026-01-01'),
      },
    ]);
    expect((await getAllCourses()).map((course) => course.id)).toEqual([
      'git-and-github',
      'nextjs',
    ]);
  });

  it('finds a course by its slug', async () => {
    expect((await getCourseById('nextjs'))?.name).toBe('Next.js');
    expect(await getCourseById('no-existe')).toBeUndefined();
  });
});

describe('listRecommendationsForReview', () => {
  it('puts the pending ones first, newest first within each status', async () => {
    prismaMock.recommendation.findMany.mockResolvedValue([
      { id: 'a', status: 'APPROVED' },
      { id: 'p1', status: 'PENDING' },
      { id: 'r', status: 'REJECTED' },
      { id: 'p2', status: 'PENDING' },
    ] as never);

    expect((await listRecommendationsForReview()).map((item) => item.id)).toEqual([
      'p1',
      'p2',
      'a',
      'r',
    ]);
    expect(prismaMock.recommendation.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ createdAt: 'desc' }, { position: 'desc' }],
        include: {
          submittedBy: { select: { id: true, name: true } },
          reviewedBy: { select: { id: true, name: true } },
        },
      }),
    );
  });
});
